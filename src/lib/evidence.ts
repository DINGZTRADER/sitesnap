import type { PhotoRecord, Tag } from '../types/domain';

type LocalRecordStorage = Pick<Storage, 'getItem' | 'setItem'>;
const localRecordKey = (projectId: string) => 'sitesnap:records:' + projectId;

export function getPairedPhotos(records: PhotoRecord[], projectId: string): { before: PhotoRecord; after: PhotoRecord } | null {
  const projectRecords = records.filter(record => record.projectId === projectId);
  const before = projectRecords.find(record => record.stage === 'before');
  const after = projectRecords.find(record => record.stage === 'after');
  return before && after ? { before, after } : null;
}

export function appendPhotoRecord(records: PhotoRecord[], record: PhotoRecord): PhotoRecord[] {
  return [record, ...records];
}

export function canSaveCapture(file: File | null): boolean {
  return file !== null && file.type.startsWith('image/');
}

export function filterPhotoRecords(records: PhotoRecord[], tag: Tag | 'All'): PhotoRecord[] {
  return tag === 'All' ? records : records.filter(record => record.tags.includes(tag));
}

export function loadLocalRecords(storage: LocalRecordStorage | null, projectId: string): PhotoRecord[] {
  if (!storage) return [];
  try {
    const value: unknown = JSON.parse(storage.getItem(localRecordKey(projectId)) ?? 'null');
    if (!Array.isArray(value)) return [];
    return value.filter((record): record is PhotoRecord => (
      typeof record === 'object'
      && record !== null
      && typeof record.id === 'string'
      && record.projectId === projectId
      && typeof record.image === 'string'
      && typeof record.timestamp === 'string'
      && typeof record.capturedBy === 'string'
      && typeof record.role === 'string'
      && typeof record.location === 'string'
      && Array.isArray(record.tags)
      && typeof record.note === 'string'
      && (record.syncStatus === 'synced' || record.syncStatus === 'pending')
    ));
  } catch {
    return [];
  }
}

export function saveLocalRecords(storage: LocalRecordStorage | null, projectId: string, records: PhotoRecord[]): void {
  if (!storage) return;
  try {
    storage.setItem(localRecordKey(projectId), JSON.stringify(records));
  } catch {
    // Local storage can be unavailable or full in a browser demo.
  }
}

export function updateComparisonPosition(position: number, key: string): number {
  const nextPosition = key === 'ArrowRight'
    ? position + 5
    : key === 'ArrowLeft'
      ? position - 5
      : key === 'Home'
        ? 0
        : key === 'End'
          ? 100
          : position;
  return Math.max(0, Math.min(100, nextPosition));
}
