'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="block animate-fade-in rounded-lg border border-border p-4 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <h3 className="text-lg font-semibold text-foreground">
        {note.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {note.content}
      </p>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
      </p>
    </Link>
  );
}
