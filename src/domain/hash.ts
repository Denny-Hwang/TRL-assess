/**
 * SHA-256 via Web Crypto (BUILD_SPEC Phase 2, task 7).
 * Works in the browser and under Node (globalThis.crypto.subtle exists in Node 20+).
 */
export async function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto (crypto.subtle) is not available in this environment');

  const source =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : ArrayBuffer.isView(data)
        ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
        : new Uint8Array(data);

  /*
   * Copy into a freshly allocated array before hashing. A Uint8Array or ArrayBuffer that came from
   * another realm — jsdom's FileReader and TextEncoder both produce them — is rejected by Node's
   * Web Crypto implementation with ERR_INVALID_ARG_TYPE, even though it looks like a BufferSource.
   * Copying costs one pass over the bytes and makes the function work in every environment.
   */
  const bytes = new Uint8Array(source.byteLength);
  bytes.set(source);

  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  // Older browsers (and jsdom) expose FileReader but not Blob.arrayBuffer.
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file'));
    reader.readAsArrayBuffer(blob);
  });
}

export async function sha256OfBlob(blob: Blob): Promise<string> {
  return sha256Hex(await blobToArrayBuffer(blob));
}
