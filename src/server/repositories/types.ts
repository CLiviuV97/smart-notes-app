import type { Note, PaginatedResult } from '@/types/note';

export interface INotesRepository {
  findByOwner(
    uid: string,
    opts: { limit: number; cursor?: string },
  ): Promise<PaginatedResult<Note>>;
  findById(id: string): Promise<Note | null>;
  create(data: { ownerId: string; title: string; content: string }): Promise<Note>;
  update(
    id: string,
    patch: {
      title?: string;
      content?: string;
      summary?: string;
      tags?: string[];
      aiGeneratedAt?: string;
    },
  ): Promise<Note>;
  delete(id: string): Promise<void>;
}
