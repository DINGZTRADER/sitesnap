import assert from 'node:assert/strict';
import test from 'node:test';

test('sends Google sign-in back to the allowed SiteSnap callback', async () => {
  const module = await import('../src/lib/google-auth.ts').catch(() => undefined);

  assert.ok(module, 'Google sign-in request helper is available');
  assert.deepEqual(
    module.createGoogleSignInRequest('https://sitesnap.wachaai.com'),
    {
      provider: 'google',
      options: { redirectTo: 'https://sitesnap.wachaai.com/auth/callback' },
    },
  );
});
