import assert from 'node:assert/strict';
import test from 'node:test';
import { getDisplayName, getSafeNextPath } from '../src/lib/auth.ts';
import { getMagicLinkRedirectUrl } from '../src/lib/auth-redirect.ts';

test('accepts a same-origin project path and rejects an external redirect', () => {
  assert.equal(getSafeNextPath('/projects/hackney'), '/projects/hackney');
  assert.equal(getSafeNextPath('https://malicious.example'), '/');
});

test('falls back to the email local-part when a display name is missing', () => {
  assert.equal(getDisplayName({ email: 'liam@example.com', user_metadata: {} }), 'liam');
  assert.equal(getDisplayName({ email: 'liam@example.com', user_metadata: { display_name: 'Liam Cooper' } }), 'Liam Cooper');
});

test('uses the exact allowed callback URL for a magic link', () => {
  assert.equal(
    getMagicLinkRedirectUrl('https://sitesnap.wachaai.com'),
    'https://sitesnap.wachaai.com/auth/callback',
  );
});
