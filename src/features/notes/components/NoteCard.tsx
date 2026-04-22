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
      className="block rounded-lg border border-zinc-200 p-4 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-800"
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {note.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {note.content}
      </p>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
      </p>
    </Link>
  );
}
