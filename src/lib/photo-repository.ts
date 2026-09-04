import { photos as demoPhotos } from '@/lib/mock-data';
import { appendPhotoRecord, loadLocalRecords, saveLocalRecords } from '@/lib/evidence';
import { compressImage, getImageExtension, validateImageFile } from '@/lib/image-upload';
import type { RepositoryContext } from '@/lib/repository-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { PhotoRecord, Tag } from '@/types/domain';

const signedUrlLifetimeSeconds = 60 * 60;
const availableTags: Tag[] = ['Pre-Cover', 'Firestop Inspection', 'Sub-base', 'JCT Variation', 'Snagging Defect', 'Daily Progress'];

type CloudRepositoryContext = RepositoryContext & {
  mode: 'cloud';
  workspaceId: string;
  userId: string;
  supabase: SupabaseClient<Database>;
};

function requireCloudContext(context: RepositoryContext): CloudRepositoryContext {
  if (context.mode !== 'cloud' || !context.supabase || !context.workspaceId || !context.userId) {
    throw new Error('Sign in to use shared photo records.');
  }
  return context as CloudRepositoryContext;
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Image could not be read.'));
    reader.onerror = () => reject(reader.error ?? new Error('Image could not be read.'));
    reader.readAsDataURL(file);
  });
}

function createLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `local-${Date.now()}`;
}

function isTag(value: string): value is Tag {
  return availableTags.includes(value as Tag);
}

function formatCapturedAt(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

async function getProfile(context: CloudRepositoryContext): Promise<{ displayName: string; role: string }> {
  const { data, error } = await context.supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', context.userId)
    .maybeSingle();
  if (error) throw error;
  return { displayName: data?.display_name ?? 'Site Manager', role: data?.role ?? 'Site Manager' };
}

async function signedImageUrl(context: CloudRepositoryContext, imagePath: string): Promise<string> {
  const { data, error } = await context.supabase.storage.from('site-photos').createSignedUrl(imagePath, signedUrlLifetimeSeconds);
  if (error || !data?.signedUrl) throw error ?? new Error('The site photo could not be displayed.');
  return data.signedUrl;
}

function mapCloudRecord(
  row: Database['public']['Tables']['photo_records']['Row'],
  image: string,
  profile: { displayName: string; role: string },
  userId: string,
): PhotoRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    image,
    timestamp: formatCapturedAt(row.captured_at),
    capturedBy: row.captured_by === userId ? profile.displayName : 'Workspace team member',
    role: row.captured_by === userId ? profile.role : 'Site team',
    location: row.location || 'Site record',
    tags: row.tags.filter(isTag),
    note: row.note || 'Photo added from the field.',
    syncStatus: 'synced',
    ...(row.stage === 'before' || row.stage === 'after' ? { stage: row.stage } : {}),
    ...(row.paired_photo_id ? { pairedPhotoId: row.paired_photo_id } : {}),
  };
}

export async function listPhotoRecords(context: RepositoryContext, projectId: string): Promise<PhotoRecord[]> {
  if (context.mode === 'demo') {
    return [...loadLocalRecords(getBrowserStorage(), projectId), ...demoPhotos.filter(record => record.projectId === projectId)];
  }

  const cloudContext = requireCloudContext(context);
  const [{ data, error }, profile] = await Promise.all([
    cloudContext.supabase
      .from('photo_records')
      .select('id, project_id, image_path, captured_at, captured_by, location, tags, note, stage, paired_photo_id, created_at')
      .eq('project_id', projectId)
      .order('captured_at', { ascending: false }),
    getProfile(cloudContext),
  ]);
  if (error) throw error;

  return Promise.all(data.map(async row => mapCloudRecord(row, await signedImageUrl(cloudContext, row.image_path), profile, cloudContext.userId)));
}

async function rollbackCloudRecord(context: CloudRepositoryContext, recordId: string, imagePath: string): Promise<void> {
  await context.supabase.storage.from('site-photos').remove([imagePath]);
  await context.supabase.from('photo_records').delete().eq('id', recordId);
}

export async function createPhotoRecord(
  context: RepositoryContext,
  input: { projectId: string; file: File; note: string; tags: Tag[] },
): Promise<PhotoRecord> {
  const validation = validateImageFile(input.file);
  if (!validation.ok) throw new Error(validation.message);
  const compressed = await compressImage(validation.file);
  const note = input.note.trim() || 'Photo added from the field.';

  if (context.mode === 'demo') {
    const record: PhotoRecord = {
      id: 'local-' + createLocalId(),
      projectId: input.projectId,
      image: await readFileAsDataUrl(compressed),
      timestamp: 'Just now',
      capturedBy: 'Liam Cooper',
      role: 'Site Manager',
      location: 'New local record',
      tags: input.tags,
      note,
      syncStatus: 'pending',
    };
    const storage = getBrowserStorage();
    saveLocalRecords(storage, input.projectId, appendPhotoRecord(loadLocalRecords(storage, input.projectId), record));
    return record;
  }

  const cloudContext = requireCloudContext(context);
  const recordId = createLocalId();
  const imagePath = `${cloudContext.workspaceId}/${input.projectId}/${recordId}.${getImageExtension(compressed)}`;
  const { data: row, error: insertError } = await cloudContext.supabase
    .from('photo_records')
    .insert({
      id: recordId,
      project_id: input.projectId,
      image_path: imagePath,
      captured_by: cloudContext.userId,
      note,
      tags: input.tags,
      location: 'Field capture',
    })
    .select('id, project_id, image_path, captured_at, captured_by, location, tags, note, stage, paired_photo_id, created_at')
    .single();
  if (insertError || !row) throw insertError ?? new Error('The photo record could not be created.');

  const { error: uploadError } = await cloudContext.supabase.storage.from('site-photos').upload(imagePath, compressed, {
    cacheControl: '3600',
    contentType: compressed.type,
    upsert: false,
  });
  if (uploadError) {
    await rollbackCloudRecord(cloudContext, recordId, imagePath);
    throw uploadError;
  }

  try {
    const [image, profile] = await Promise.all([signedImageUrl(cloudContext, imagePath), getProfile(cloudContext)]);
    return mapCloudRecord(row, image, profile, cloudContext.userId);
  } catch (error) {
    await rollbackCloudRecord(cloudContext, recordId, imagePath);
    throw error;
  }
}
