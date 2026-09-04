import assert from 'node:assert/strict';
import test from 'node:test';
import { validateProjectInput } from '../src/lib/project-input.ts';

test('requires a site name and address and normalises whitespace', () => {
  assert.deepEqual(validateProjectInput({ name: '  Mews Site  ', address: '  14 Warburton St  ', clientName: ' Derwent London ', code: '' }), {
    ok: true,
    value: { name: 'Mews Site', address: '14 Warburton St', clientName: 'Derwent London', code: 'MEWS-SITE' },
  });
});

test('rejects a missing site name or address', () => {
  const result = validateProjectInput({ name: '', address: '', clientName: '', code: '' });
  assert.equal(result.ok, false);
});
