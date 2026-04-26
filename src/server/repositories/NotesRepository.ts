import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { AppError } from '@/server/errors/AppError';
import type { Note, PaginatedResult } from '@/types/note';
import type { INotesRepository } from './types';

function toIsoString(value: unknown, fallback?: string): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return fallback ?? null;
}

class NotesRepository implements INotesRepository {
  private collection = adminDb.collection('notes');

  async findByOwner(
    uid: string,
    opts: { limit: number; cursor?: string },
  ): Promise<PaginatedResult<Note>> {
    let query = this.collection
      .where('ownerId', '==', uid)
      .orderBy('updatedAt', 'desc')
      .limit(opts.limit + 1);

    if (opts.cursor) {
      const cursorDoc = await this.collection.doc(opts.cursor).get();
      if (!cursorDoc.exists) {
        throw new AppError('Invalid cursor', 'INVALID_CURSOR', 400);
      }
      query = query.startAfter(cursorDoc);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > opts.limit;
    const items = docs.slice(0, opts.limit).map((doc) => this.toNote(doc));
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    return { items, nextCursor };
  }

  async findById(id: string): Promise<Note | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? this.toNote(doc) : null;
  }

  async create(data: {
    ownerId: string;
    title: string;
    content: string;
    summary?: string | null;
    tags?: string[];
    aiGeneratedAt?: string | null;
  }): Promise<Note> {
    const ref = await this.collection.add({
      ownerId: data.ownerId,
      title: data.title,
      content: data.content,
      summary: data.summary ?? null,
      tags: data.tags ?? [],
      aiGeneratedAt: data.aiGeneratedAt ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const doc = await ref.get();
    return this.toNote(doc);
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
    await this.collection.doc(id).update({
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const doc = await this.collection.doc(id).get();
    return this.toNote(doc);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async updateIfOwner(
    uid: string,
    id: string,
    patch: {
      title?: string;
      content?: string;
      summary?: string;
      tags?: string[];
      aiGeneratedAt?: string;
    },
  ): Promise<Note> {
    const ref = this.collection.doc(id);
    return adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists) throw AppError.notFound('Note not found');
      if (doc.data()!.ownerId !== uid) throw AppError.forbidden();
      const updatedData = { ...patch, updatedAt: FieldValue.serverTimestamp() };
      tx.update(ref, updatedData);
      const data = { ...doc.data()!, ...patch, updatedAt: new Date().toISOString() };
      return this.toNoteFromData(id, data);
    });
  }

  async deleteIfOwner(uid: string, id: string): Promise<void> {
    const ref = this.collection.doc(id);
    await adminDb.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists) throw AppError.notFound('Note not found');
      if (doc.data()!.ownerId !== uid) throw AppError.forbidden();
      tx.delete(ref);
    });
  }

  private toNoteFromData(id: string, data: FirebaseFirestore.DocumentData): Note {
    const now = new Date().toISOString();
    return {
      id,
      ownerId: data.ownerId,
      title: data.title,
      content: data.content,
      summary: data.summary ?? null,
      tags: data.tags ?? [],
      aiGeneratedAt: toIsoString(data.aiGeneratedAt),
      createdAt: toIsoString(data.createdAt, now)!,
      updatedAt: toIsoString(data.updatedAt, now)!,
    };
  }

  private toNote(doc: FirebaseFirestore.DocumentSnapshot): Note {
    return this.toNoteFromData(doc.id, doc.data()!);
  }
}

export const notesRepository = new NotesRepository();
