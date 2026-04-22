'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { setSelectedNote } from '@/features/notes/store/notesUiSlice';
import { NoteEditor } from '@/features/notes/components/NoteEditor';
import { GenerateAIButton } from '@/features/notes/components/GenerateAIButton';
import { DeleteNoteButton } from '@/features/notes/components/DeleteNoteButton';

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const noteId = params.id;

  useEffect(() => {
    dispatch(setSelectedNote(noteId));
    return () => {
      dispatch(setSelectedNote(null));
    };
  }, [noteId, dispatch]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-1 border-b border-border px-4 py-2">
        <GenerateAIButton noteId={noteId} />
        <DeleteNoteButton noteId={noteId} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <NoteEditor noteId={noteId} />
      </div>
    </div>
  );
}
