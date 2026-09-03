import type { PhotoRecord } from '../types/domain';

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
