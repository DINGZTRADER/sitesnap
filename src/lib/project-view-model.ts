import type { RuntimeMode } from './runtime-mode';
import type { PhotoRecord } from '@/types/domain';

export function getProjectPair(records: PhotoRecord[], projectId: string): { before: PhotoRecord; after: PhotoRecord } | null {
  const projectRecords = records.filter(record => record.projectId === projectId);
  for (const before of projectRecords.filter(record => record.stage === 'before')) {
    const after = projectRecords.find(record => record.stage === 'after'
      && (record.pairedPhotoId === before.id || before.pairedPhotoId === record.id));
    if (after) return { before, after };
  }
  return null;
}

export function getWorkspaceStatus(mode: RuntimeMode, isAuthenticated: boolean): 'Demo workspace · local only' | 'Cloud pilot · synced' | 'Sign in to sync across devices' {
  if (mode === 'demo') return 'Demo workspace · local only';
  return isAuthenticated ? 'Cloud pilot · synced' : 'Sign in to sync across devices';
}
