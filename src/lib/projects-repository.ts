import { projects as demoProjects } from '@/lib/mock-data';
import { validateProjectInput, type CreateProjectInput } from '@/lib/project-input';
import type { RepositoryContext } from '@/lib/repository-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Project } from '@/types/domain';

const localProjectsKey = 'sitesnap:projects';
const demoAccents = ['#f4d35e', '#b8f36b', '#a8d8ea', '#f6b6c8'];

function getLocalStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function readLocalProjects(): Project[] {
  const storage = getLocalStorage();
  if (!storage) return [];

  try {
    const value: unknown = JSON.parse(storage.getItem(localProjectsKey) ?? 'null');
    if (!Array.isArray(value)) return [];
    return value.filter((project): project is Project => (
      typeof project === 'object'
      && project !== null
      && typeof project.id === 'string'
      && typeof project.name === 'string'
      && typeof project.code === 'string'
      && typeof project.clientName === 'string'
      && typeof project.address === 'string'
      && (project.status === 'active' || project.status === 'archived')
      && typeof project.progress === 'number'
      && typeof project.photoCount === 'number'
      && typeof project.updatedAt === 'string'
      && typeof project.accent === 'string'
    ));
  } catch {
    return [];
  }
}

function writeLocalProjects(projects: Project[]): void {
  try {
    getLocalStorage()?.setItem(localProjectsKey, JSON.stringify(projects));
  } catch {
    // Browser storage can be unavailable or full in a demo environment.
  }
}

function createLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `local-${Date.now()}`;
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function mapCloudProject(row: {
  id: string;
  name: string;
  code: string;
  client_name: string;
  address: string;
  status: string;
  progress: number;
  updated_at: string;
}): Project {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    clientName: row.client_name,
    address: row.address,
    status: row.status === 'archived' ? 'archived' : 'active',
    progress: row.progress,
    photoCount: 0,
    updatedAt: formatUpdatedAt(row.updated_at),
    accent: '#b8f36b',
  };
}

type CloudRepositoryContext = RepositoryContext & {
  mode: 'cloud';
  workspaceId: string;
  userId: string;
  supabase: SupabaseClient<Database>;
};

function requireCloudContext(context: RepositoryContext): CloudRepositoryContext {
  if (context.mode !== 'cloud' || !context.supabase || !context.workspaceId || !context.userId) {
    throw new Error('Sign in to load your shared SiteSnap workspace.');
  }
  return context as CloudRepositoryContext;
}

export async function listProjects(context: RepositoryContext): Promise<Project[]> {
  if (context.mode === 'demo') return [...readLocalProjects(), ...demoProjects];

  const cloudContext = requireCloudContext(context);
  const { data, error } = await cloudContext.supabase
    .from('projects')
    .select('id, name, code, client_name, address, status, progress, updated_at')
    .eq('workspace_id', cloudContext.workspaceId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data.map(mapCloudProject);
}

export async function createProject(input: CreateProjectInput, context: RepositoryContext): Promise<Project> {
  const result = validateProjectInput(input);
  if (!result.ok) throw new Error(Object.values(result.errors).join(' '));

  if (context.mode === 'demo') {
    const localProjects = readLocalProjects();
    const project: Project = {
      id: createLocalId(),
      ...result.value,
      status: 'active',
      progress: 0,
      photoCount: 0,
      updatedAt: 'Just now',
      accent: demoAccents[localProjects.length % demoAccents.length],
    };
    writeLocalProjects([project, ...localProjects]);
    return project;
  }

  const cloudContext = requireCloudContext(context);
  const { data, error } = await cloudContext.supabase
    .from('projects')
    .insert({
      workspace_id: cloudContext.workspaceId,
      name: result.value.name,
      code: result.value.code,
      client_name: result.value.clientName,
      address: result.value.address,
      created_by: cloudContext.userId,
    })
    .select('id, name, code, client_name, address, status, progress, updated_at')
    .single();

  if (error || !data) throw error ?? new Error('Site creation failed.');
  return mapCloudProject(data);
}
