import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import type { Note, PaginatedResult } from '@/types/note';
import type { INotesRepository } from './types';

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
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
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

  private toNote(doc: FirebaseFirestore.DocumentSnapshot): Note {
    const data = doc.data()!;
    return {
      id: doc.id,
      ownerId: data.ownerId,
      title: data.title,
      content: data.content,
      summary: data.summary ?? null,
      tags: data.tags ?? [],
      aiGeneratedAt: data.aiGeneratedAt
        ? data.aiGeneratedAt instanceof Timestamp
          ? data.aiGeneratedAt.toDate().toISOString()
          : data.aiGeneratedAt
        : null,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt ?? new Date().toISOString()),
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt ?? new Date().toISOString()),
    };
  }
}

export const notesRepository = new NotesRepository();
