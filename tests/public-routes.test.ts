import assert from 'node:assert/strict';
import test from 'node:test';
import { requiresAuthentication } from '../src/lib/public-routes.ts';

test('allows policy pages to stay public while protecting workspace pages', () => {
  assert.equal(requiresAuthentication('/privacy'), false);
  assert.equal(requiresAuthentication('/terms'), false);
  assert.equal(requiresAuthentication('/projects/hackney'), true);
});
