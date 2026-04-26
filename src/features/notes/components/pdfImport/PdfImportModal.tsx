'use client';

import { useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from '@/components/ui/Spinner';
import { usePdfImport } from './usePdfImport';
import { PdfDropzone } from './PdfDropzone';
import { PdfUploading } from './PdfUploading';
import { PdfPreview } from './PdfPreview';

interface PdfImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfImportModal({ open, onOpenChange }: PdfImportModalProps) {
  const { state, dispatch, handleDrop, handleCancel, handleSave } = usePdfImport(() =>
    onOpenChange(false),
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        dispatch({ type: 'RESET' });
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, dispatch],
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-border bg-background p-6 shadow-md',
            'data-[state=open]:animate-scale-in',
            'focus:outline-none',
            'max-h-[85vh] overflow-y-auto',
          )}
          aria-describedby="pdf-import-desc"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Import PDF
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description id="pdf-import-desc" className="sr-only">
            Upload a PDF to extract its text content and save as a note.
          </Dialog.Description>

          <div className="mt-4">
            {state.stage === 'idle' && <PdfDropzone onDrop={handleDrop} />}

            {state.stage === 'uploading' && <PdfUploading onCancel={handleCancel} />}

            {state.stage === 'preview' && (
              <PdfPreview
                state={state}
                dispatch={dispatch}
                onSave={handleSave}
                onDiscard={() => dispatch({ type: 'RESET' })}
              />
            )}

            {state.stage === 'saving' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="md" />
                <p className="mt-4 text-sm text-muted-foreground">Saving note...</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
