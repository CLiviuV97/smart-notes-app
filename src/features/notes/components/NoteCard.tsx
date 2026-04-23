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
      className="block animate-fade-up rounded-[7px] border border-rule p-4 transition hover:border-rule-2 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <h3 className="font-serif text-[17px] font-medium text-ink">{note.title}</h3>
      <p className="mt-1 line-clamp-2 font-serif text-[14px] leading-snug text-ink-2">
        {note.content}
      </p>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full border border-rule bg-paper-2 px-2 py-0.5 font-sans text-[11px] text-ink-2"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 font-mono text-[10.5px] uppercase text-ink-3">
        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
      </p>
    </Link>
  );
}
