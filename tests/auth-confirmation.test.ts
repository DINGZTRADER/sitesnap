import assert from 'node:assert/strict';
import test from 'node:test';

test('accepts a server-verified email token without a browser PKCE code', async () => {
  const module = await import('../src/lib/auth-confirmation.ts').catch(() => undefined);

  assert.ok(module, 'email confirmation outcome helper is available');
  const outcome = await module.resolveEmailConfirmationOutcome(
    'server-verifiable-token',
    async () => ({ error: null }),
  );

  assert.equal(outcome, 'authenticated');
});

test('rejects a missing email token before attempting verification', async () => {
  const module = await import('../src/lib/auth-confirmation.ts').catch(() => undefined);

  assert.ok(module, 'email confirmation outcome helper is available');
  const outcome = await module.resolveEmailConfirmationOutcome(null, async () => ({ error: null }));

  assert.equal(outcome, 'missing-token');
});
