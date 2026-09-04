import test from 'node:test';
import assert from 'node:assert/strict';
import { compressImage, getCompressionDefaults, validateImageFile } from '../src/lib/image-upload.ts';

const file = (name: string, type: string, size: number) => ({ name, type, size } as File);

test('rejects missing, unsupported, and oversized images', () => {
  assert.equal(validateImageFile(null).ok, false);
  assert.equal(validateImageFile(file('notes.txt', 'text/plain', 20)).ok, false);
  assert.equal(validateImageFile(file('site.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1)).ok, false);
});

test('accepts the supported construction image formats under the size limit', () => {
  for (const [name, type] of [['site.jpg', 'image/jpeg'], ['site.png', 'image/png'], ['site.heic', 'image/heic']]) {
    const result = validateImageFile(file(name, type, 1024));
    assert.equal(result.ok, true);
  }
});

test('uses the documented compression defaults', () => {
  assert.deepEqual(getCompressionDefaults(), { maxEdge: 1600, quality: 0.82 });
  assert.deepEqual(getCompressionDefaults({ maxEdge: 1200 }), { maxEdge: 1200, quality: 0.82 });
});

test('compression requires an accepted image file', async () => {
  await assert.rejects(() => compressImage(file('bad.txt', 'text/plain', 20)), /JPG, PNG, or HEIC/i);
});
