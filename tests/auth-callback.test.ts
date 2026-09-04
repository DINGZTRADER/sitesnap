import assert from 'node:assert/strict';
import test from 'node:test';

test('accepts a successfully exchanged session without workspace setup', async () => {
  const module = await import('../src/lib/auth-callback.ts').catch(() => undefined);

  assert.ok(module, 'auth callback outcome helper is available');
  const outcome = await module.resolveAuthCallbackOutcome(
    'fresh-auth-code',
    async () => ({ error: null }),
  );

  assert.equal(outcome, 'authenticated');
});
