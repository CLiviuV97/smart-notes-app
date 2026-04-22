const PDF_MAGIC_BYTES = Buffer.from('%PDF');

export function isPdfMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return buffer.subarray(0, 4).equals(PDF_MAGIC_BYTES);
}
