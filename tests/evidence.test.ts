import test from 'node:test';
import assert from 'node:assert/strict';
import type { PhotoRecord } from '../src/types/domain';
import { appendPhotoRecord, canSaveCapture, getPairedPhotos } from '../src/lib/evidence.ts';

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
  assert.equal(canSaveCapture({ name: 'site.jpg' } as File), true);
});
