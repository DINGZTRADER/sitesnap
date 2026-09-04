import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectPair, getWorkspaceStatus } from '../src/lib/project-view-model.ts';
import type { PhotoRecord } from '../src/types/domain';

const record = (id: string, projectId: string, stage?: 'before' | 'after'): PhotoRecord => ({
  id,
  projectId,
  image: `${id}.jpg`,
  timestamp: id,
  capturedBy: 'Tester',
  role: 'Foreman',
  location: 'Site',
  tags: ['Daily Progress'],
  note: id,
  syncStatus: 'synced',
  stage,
});

test('returns a pair only from the selected project', () => {
  const hackneyBefore = record('hackney-before', 'hackney', 'before');
  const hackneyAfter = record('hackney-after', 'hackney', 'after');
  hackneyBefore.pairedPhotoId = hackneyAfter.id;
  hackneyAfter.pairedPhotoId = hackneyBefore.id;
  assert.deepEqual(getProjectPair([record('north-after', 'northampton', 'after'), hackneyBefore, hackneyAfter], 'hackney'), { before: hackneyBefore, after: hackneyAfter });
  assert.equal(getProjectPair([hackneyBefore, record('north-after', 'northampton', 'after')], 'hackney'), null);
});

test('returns the correct workspace status copy', () => {
  assert.equal(getWorkspaceStatus('demo', false), 'Demo workspace · local only');
  assert.equal(getWorkspaceStatus('cloud', true), 'Cloud pilot · synced');
  assert.equal(getWorkspaceStatus('cloud', false), 'Sign in to sync across devices');
});
