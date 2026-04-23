// Mock the NotesRepository module to avoid firebase-admin import
jest.mock('@/server/repositories/NotesRepository', () => ({
  notesRepository: {},
}));

import { NotesService } from '../NotesService';
import { AppError } from '@/server/errors/AppError';
import type { Note, PaginatedResult } from '@/types/note';
import type { INotesRepository } from '@/server/repositories/types';

class InMemoryNotesRepository implements INotesRepository {
  private store = new Map<string, Note>();
  private counter = 0;

  async findByOwner(
    uid: string,
    opts: { limit: number; cursor?: string },
  ): Promise<PaginatedResult<Note>> {
    const all = [...this.store.values()]
      .filter((n) => n.ownerId === uid)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    let startIndex = 0;
    if (opts.cursor) {
      const idx = all.findIndex((n) => n.id === opts.cursor);
      if (idx !== -1) startIndex = idx + 1;
    }

    const items = all.slice(startIndex, startIndex + opts.limit);
    const hasMore = startIndex + opts.limit < all.length;
    return { items, nextCursor: hasMore ? items[items.length - 1]!.id : null };
  }

  async findById(id: string): Promise<Note | null> {
    return this.store.get(id) ?? null;
  }

  async create(data: { ownerId: string; title: string; content: string }): Promise<Note> {
    const id = `note-${++this.counter}`;
    const now = new Date().toISOString();
    const note: Note = {
      id,
      ownerId: data.ownerId,
      title: data.title,
      content: data.content,
      summary: null,
      tags: [],
      aiGeneratedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id, note);
    return note;
  }

  async update(
    id: string,
    patch: {
      title?: string;
      content?: string;
      summary?: string;
      tags?: string[];
      aiGeneratedAt?: string;
    },
  ): Promise<Note> {
    const existing = this.store.get(id)!;
    const updated: Note = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

describe('NotesService', () => {
  let repo: InMemoryNotesRepository;
  let service: NotesService;

  beforeEach(() => {
    repo = new InMemoryNotesRepository();
    service = new NotesService(repo);
  });

  describe('create', () => {
    it('creates a note with the correct ownerId', async () => {
      const note = await service.create('user-1', { title: 'Test', content: 'Body' });
      expect(note.ownerId).toBe('user-1');
      expect(note.title).toBe('Test');
      expect(note.content).toBe('Body');
      expect(note.summary).toBeNull();
      expect(note.tags).toEqual([]);
    });
  });

  describe('list', () => {
    it('returns only notes belonging to the owner', async () => {
      await service.create('user-1', { title: 'A', content: '' });
      await service.create('user-2', { title: 'B', content: '' });
      await service.create('user-1', { title: 'C', content: '' });

      const result = await service.list('user-1', { limit: 10 });
      expect(result.items).toHaveLength(2);
      expect(result.items.every((n) => n.ownerId === 'user-1')).toBe(true);
    });
  });

  describe('getById', () => {
    it('returns the note when owner matches', async () => {
      const created = await service.create('user-1', { title: 'Mine', content: 'text' });
      // eslint-disable-next-line testing-library/no-await-sync-queries -- not a testing-library query
      const found = await service.getById('user-1', created.id);
      expect(found.id).toBe(created.id);
    });

    it('throws NOT_FOUND for non-existent note', async () => {
      await expect(service.getById('user-1', 'nope')).rejects.toThrow(AppError);
      await expect(service.getById('user-1', 'nope')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
      });
    });

    it('throws FORBIDDEN when owner does not match', async () => {
      const created = await service.create('user-1', { title: 'Private', content: '' });
      await expect(service.getById('user-2', created.id)).rejects.toThrow(AppError);
      await expect(service.getById('user-2', created.id)).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: 403,
      });
    });
  });

  describe('update', () => {
    it('updates the note when owner matches', async () => {
      const created = await service.create('user-1', { title: 'Old', content: 'old' });
      const updated = await service.update('user-1', created.id, { title: 'New' });
      expect(updated.title).toBe('New');
      expect(updated.content).toBe('old');
    });

    it('throws FORBIDDEN when owner does not match', async () => {
      const created = await service.create('user-1', { title: 'X', content: '' });
      await expect(service.update('user-2', created.id, { title: 'Hacked' })).rejects.toMatchObject(
        {
          code: 'FORBIDDEN',
          status: 403,
        },
      );
    });
  });

  describe('delete', () => {
    it('deletes the note when owner matches', async () => {
      const created = await service.create('user-1', { title: 'Bye', content: '' });
      await service.delete('user-1', created.id);
      await expect(service.getById('user-1', created.id)).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('throws FORBIDDEN when owner does not match', async () => {
      const created = await service.create('user-1', { title: 'X', content: '' });
      await expect(service.delete('user-2', created.id)).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: 403,
      });
    });
  });
});
