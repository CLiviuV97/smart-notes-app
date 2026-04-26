import { AppError } from '@/server/errors/AppError';
import type { Note, PaginatedResult } from '@/types/note';
import type { INotesRepository } from '@/server/repositories/types';
import { notesRepository } from '@/server/repositories/NotesRepository';
import type { CreateNoteInput } from '@/lib/validators/noteSchemas';

export class NotesService {
  constructor(private repo: INotesRepository) {}

  async list(
    uid: string,
    opts: { limit: number; cursor?: string },
  ): Promise<PaginatedResult<Note>> {
    return this.repo.findByOwner(uid, opts);
  }

  async getById(uid: string, id: string): Promise<Note> {
    const note = await this.repo.findById(id);
    if (!note) {
      throw new AppError('Note not found', 'NOT_FOUND', 404);
    }
    if (note.ownerId !== uid) {
      throw new AppError('Forbidden', 'FORBIDDEN', 403);
    }
    return note;
  }

  async create(uid: string, input: CreateNoteInput): Promise<Note> {
    return this.repo.create({ ownerId: uid, ...input });
  }

  async update(
    uid: string,
    id: string,
    patch: { title?: string; content?: string },
  ): Promise<Note> {
    return this.repo.updateIfOwner(uid, id, patch);
  }

  async delete(uid: string, id: string): Promise<void> {
    return this.repo.deleteIfOwner(uid, id);
  }
}

export function notesServiceFactory(repo: INotesRepository = notesRepository) {
  return new NotesService(repo);
}
