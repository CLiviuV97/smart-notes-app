import { createNoteSchema, updateNoteSchema, listQuerySchema } from '../noteSchemas';

describe('createNoteSchema', () => {
  it('accepts valid input', () => {
    const result = createNoteSchema.safeParse({
      title: 'My Note',
      content: 'Some content',
    });
    expect(result.success).toBe(true);
  });

  it('accepts full input with optional fields', () => {
    const result = createNoteSchema.safeParse({
      title: 'My Note',
      content: 'Some content',
      summary: 'A summary',
      tags: ['tag1', 'tag2'],
      aiGeneratedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createNoteSchema.safeParse({
      title: '',
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title over 200 characters', () => {
    const result = createNoteSchema.safeParse({
      title: 'x'.repeat(201),
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 tags', () => {
    const result = createNoteSchema.safeParse({
      title: 'Title',
      content: 'Content',
      tags: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = createNoteSchema.safeParse({
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateNoteSchema', () => {
  it('accepts partial updates', () => {
    const result = updateNoteSchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('listQuerySchema', () => {
  it('applies defaults', () => {
    const result = listQuerySchema.parse({});
    expect(result.limit).toBe(20);
  });

  it('coerces string limit to number', () => {
    const result = listQuerySchema.parse({ limit: '10' });
    expect(result.limit).toBe(10);
  });

  it('rejects limit above 50', () => {
    const result = listQuerySchema.safeParse({ limit: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects limit below 1', () => {
    const result = listQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});
