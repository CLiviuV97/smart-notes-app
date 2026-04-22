'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useDeleteNoteMutation } from '@/features/notes/api/notesApi';
import { useAppDispatch } from '@/store';
import { setSelectedNote } from '@/features/notes/store/notesUiSlice';
import { useToast } from '@/components/ui/useToast';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DeleteNoteButtonProps {
  noteId: string;
}

export function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleteNote] = useDeleteNoteMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteNote(noteId).unwrap();
      dispatch(setSelectedNote(null));
      router.push('/notes');
      toast({ title: 'Note deleted' });
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to delete note',
        action: {
          label: 'Retry',
          onClick: () => handleDelete(),
        },
      });
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" aria-label="Delete note" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 text-danger" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
