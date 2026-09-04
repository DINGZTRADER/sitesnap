export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/heic']);

export type CompressionOptions = { maxEdge?: number; quality?: number };

export function getCompressionDefaults(options: CompressionOptions = {}): Required<CompressionOptions> {
  return {
    maxEdge: options.maxEdge ?? 1600,
    quality: options.quality ?? 0.82,
  };
}

export function validateImageFile(file: File | null): { ok: true; file: File } | { ok: false; message: string } {
  if (!file) return { ok: false, message: 'Choose a site photo before saving.' };
  if (!supportedImageTypes.has(file.type.toLowerCase())) {
    return { ok: false, message: 'Please choose a JPG, PNG, or HEIC image.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: 'Choose an image smaller than 10 MB.' };
  }
  return { ok: true, file };
}

function getFileExtension(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/heic') return 'heic';
  return 'jpg';
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image could not be decoded.'));
    };
    image.src = objectUrl;
  });
}

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
  const result = validateImageFile(file);
  if (!result.ok) throw new Error(result.message);

  // Most browsers cannot decode HEIC without an additional codec. Keep the accepted
  // original so field teams can still save it and the storage path preserves .heic.
  if (file.type === 'image/heic') return file;
  if (typeof document === 'undefined') throw new Error('Image compression is only available in a browser.');

  const { maxEdge, quality } = getCompressionDefaults(options);
  const image = await loadImage(file);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image compression is not supported in this browser.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image compression failed.')), outputType, quality);
  });
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'site-photo';
  const outputName = `${baseName}.${outputType === 'image/png' ? 'png' : 'jpg'}`;
  return new File([blob], outputName, { type: outputType, lastModified: file.lastModified });
}

export function getImageExtension(file: File): string {
  return getFileExtension(file);
}
