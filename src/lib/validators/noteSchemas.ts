import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(50_000),
});

export const updateNoteSchema = createNoteSchema.partial();

export const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
