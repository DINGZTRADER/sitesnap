import type { PhotoRecord, Tag } from '../types/domain';

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
  return file !== null;
}

export function filterPhotoRecords(records: PhotoRecord[], tag: Tag | 'All'): PhotoRecord[] {
  return tag === 'All' ? records : records.filter(record => record.tags.includes(tag));
}
