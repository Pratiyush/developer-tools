/**
 * Base64 ↔ file. The browser already has `FileReader.readAsDataURL`, but
 * that gives us a `data:<mime>;base64,…` string with the prefix. For most
 * use-cases (HTTP body, JSON field) you want plain base64 without the
 * data-URI scheme; we provide both.
 */

export interface EncodedFile {
  readonly base64: string;
  readonly dataUri: string;
  readonly mime: string;
  readonly bytes: number;
  readonly filename: string;
}

/** Encode a File to base64 + data URI. Reads the file in one shot — fine
 *  for typical "drop-a-pdf-into-an-API" sizes (up to ~50 MB). For multi-GB
 *  uploads we'd need chunked streaming, but that's outside this tool's scope.
 *
 *  Uses `Blob.arrayBuffer()` when available (every browser since 2020),
 *  falling back to FileReader for older runtimes / jsdom. */
export async function encodeFile(file: File): Promise<EncodedFile> {
  const buf = await readFileToArrayBuffer(file);
  const bytes = new Uint8Array(buf);
  // btoa works on a binary string. Walk the bytes in chunks to stay under
  // the call-stack limit on String.fromCharCode for big files.
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const base64 = btoa(binary);
  const mime = file.type || 'application/octet-stream';
  return {
    base64,
    dataUri: `data:${mime};base64,${base64}`,
    mime,
    bytes: bytes.length,
    filename: file.name,
  };
}

function readFileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  // Modern path: most browsers + Node 20+.
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
  // Fallback: FileReader. jsdom supports this even when Blob.arrayBuffer
  // isn't on the prototype.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (r instanceof ArrayBuffer) resolve(r);
      else reject(new Error('FileReader returned unexpected result'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsArrayBuffer(file);
  });
}

/** Decode a base64 string (with or without data: prefix) back to bytes
 *  + a guessed MIME type. Returns null on bad input. */
export interface DecodedBytes {
  readonly bytes: Uint8Array;
  readonly mime: string;
}

export function decodeBase64(input: string): DecodedBytes | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let mime = 'application/octet-stream';
  let payload = trimmed;
  const m = /^data:([^;,]+)(?:;base64)?,(.*)$/s.exec(trimmed);
  if (m) {
    mime = m[1] ?? mime;
    payload = m[2] ?? '';
  }
  // Strip whitespace inside the payload (some encoders add line breaks).
  payload = payload.replace(/\s+/g, '');
  try {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, mime };
  } catch {
    return null;
  }
}

/** Produce a download-ready Blob URL from base64. Caller is responsible for
 *  revoking via `URL.revokeObjectURL` when done. */
export function downloadBlobFromBase64(input: string, fallbackMime = 'application/octet-stream'):
  | { url: string; filename: string; mime: string; size: number }
  | null {
  const decoded = decodeBase64(input);
  if (!decoded) return null;
  // Cast through ArrayBuffer — BlobPart wants a strict ArrayBuffer view,
  // and we're not using SharedArrayBuffer here.
  const blob = new Blob([decoded.bytes.buffer as ArrayBuffer], {
    type: decoded.mime || fallbackMime,
  });
  return {
    url: URL.createObjectURL(blob),
    filename: 'decoded.bin',
    mime: decoded.mime,
    size: decoded.bytes.length,
  };
}
