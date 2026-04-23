'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, FolderOpen } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { setSelectedNote } from '@/features/notes/store/notesUiSlice';
import { useGetNoteQuery } from '@/features/notes/api/notesApi';
import { NoteEditor } from '@/features/notes/components/NoteEditor';
import { GenerateAIButton } from '@/features/notes/components/GenerateAIButton';
import { DeleteNoteButton } from '@/features/notes/components/DeleteNoteButton';

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const noteId = params.id;
  const { data: note } = useGetNoteQuery(noteId);

  useEffect(() => {
    dispatch(setSelectedNote(noteId));
    return () => {
      dispatch(setSelectedNote(null));
    };
  }, [noteId, dispatch]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[44px] items-center justify-between border-b border-rule px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Notes</span>
          <span className="text-ink-4">/</span>
          <span className="truncate text-ink-2">{note?.title ?? '...'}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <GenerateAIButton noteId={noteId} />
          <DeleteNoteButton noteId={noteId} />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto thin-scroll">
        <NoteEditor noteId={noteId} />
      </div>
    </div>
  );
}
