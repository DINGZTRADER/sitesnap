import test from 'node:test';
import assert from 'node:assert/strict';
import type { PhotoRecord } from '../src/types/domain';
import { appendPhotoRecord, canSaveCapture, filterPhotoRecords, getPairedPhotos, loadLocalRecords, saveLocalRecords, updateComparisonPosition } from '../src/lib/evidence.ts';

const record = (id: string, projectId: string, stage?: 'before' | 'after'): PhotoRecord => ({
  id, projectId, image: `${id}.jpg`, timestamp: id, capturedBy: 'Tester', role: 'Foreman', location: 'Site', tags: ['Daily Progress'], note: id, syncStatus: 'synced', stage,
});

test('returns the selected project before and after pair', () => {
  const before = record('north-before', 'northampton', 'before');
  const after = record('north-after', 'northampton', 'after');
  assert.deepEqual(getPairedPhotos([record('hackney-before', 'hackney', 'before'), before, after], 'northampton'), { before, after });
});

test('appends a locally saved record to the visible project records', () => {
  const existing = record('existing', 'hackney');
  const saved = record('saved', 'hackney');
  assert.deepEqual(appendPhotoRecord([existing], saved), [saved, existing]);
});

test('only allows capture save when a photo file is selected', () => {
  assert.equal(canSaveCapture(null), false);
  assert.equal(canSaveCapture({ name: 'site.txt', type: 'text/plain' } as File), false);
  assert.equal(canSaveCapture({ name: 'site.jpg', type: 'image/jpeg' } as File), true);
});

test('filters records by the selected construction tag', () => {
  const records = [{ ...record('sub-base', 'northampton'), tags: ['Sub-base'] as const }, { ...record('daily', 'northampton'), tags: ['Daily Progress'] as const }];
  assert.deepEqual(filterPhotoRecords(records, 'Sub-base').map(item => item.id), ['sub-base']);
});

test('round-trips locally saved records for one project', () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  };
  const records = [record('local-1', 'hackney', 'before')];
  saveLocalRecords(storage, 'hackney', records);
  assert.deepEqual(loadLocalRecords(storage, 'hackney'), records);
});

test('moves the before-after divider with keyboard controls', () => {
  assert.equal(updateComparisonPosition(50, 'ArrowRight'), 55);
  assert.equal(updateComparisonPosition(50, 'ArrowLeft'), 45);
  assert.equal(updateComparisonPosition(50, 'Home'), 0);
  assert.equal(updateComparisonPosition(50, 'End'), 100);
});
