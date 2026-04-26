'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileUp } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { setSelectedNote } from '@/features/notes/store/notesUiSlice';
import { useCreateNoteMutation } from '@/features/notes/api/notesApi';
import { Button } from '@/components/ui/Button';
import { PdfImportModal } from '@/features/notes/components/PdfImportModal';

interface SidebarActionsProps {
  onClose?: () => void;
}

export function SidebarActions({ onClose }: SidebarActionsProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handleCreateNote = async () => {
    try {
      const note = await createNote({ title: 'Untitled', content: '' }).unwrap();
      dispatch(setSelectedNote(note.id));
      router.push(`/notes/${note.id}`);
      onClose?.();
    } catch {
      // handled by RTK Query
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={handleCreateNote} loading={isCreating} className="flex-1">
          {!isCreating && <Plus className="h-4 w-4" />}
          New note
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsPdfModalOpen(true)}
          className="w-9 px-0"
          aria-label="Import PDF"
        >
          <FileUp className="h-4 w-4" />
        </Button>
      </div>
      <PdfImportModal open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen} />
    </>
  );
}
