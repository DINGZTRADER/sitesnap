import test from 'node:test';
import assert from 'node:assert/strict';
import { getRuntimeMode, isCloudConfigured } from '../src/lib/runtime-mode.ts';

test('uses demo mode when either public Supabase setting is missing', () => {
  assert.equal(getRuntimeMode({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '' }), 'demo');
  assert.equal(isCloudConfigured({ NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key' }), false);
});

test('uses cloud mode only when both public settings are present', () => {
  const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key' };
  assert.equal(getRuntimeMode(env), 'cloud');
  assert.equal(isCloudConfigured(env), true);
});
