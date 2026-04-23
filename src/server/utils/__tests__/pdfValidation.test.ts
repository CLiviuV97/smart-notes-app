import { isPdfMagicBytes } from '../pdfValidation';

describe('isPdfMagicBytes', () => {
  it('returns true for a valid PDF buffer', () => {
    const buf = Buffer.from('%PDF-1.4 fake content');
    expect(isPdfMagicBytes(buf)).toBe(true);
  });

  it('returns false for an empty buffer', () => {
    expect(isPdfMagicBytes(Buffer.alloc(0))).toBe(false);
  });

  it('returns false for a buffer shorter than 4 bytes', () => {
    expect(isPdfMagicBytes(Buffer.from('%PD'))).toBe(false);
  });

  it('returns false for a non-PDF buffer', () => {
    const buf = Buffer.from('PNG image data');
    expect(isPdfMagicBytes(buf)).toBe(false);
  });

  it('returns false for a buffer starting with similar but wrong bytes', () => {
    const buf = Buffer.from('%PDG-1.0');
    expect(isPdfMagicBytes(buf)).toBe(false);
  });
});
