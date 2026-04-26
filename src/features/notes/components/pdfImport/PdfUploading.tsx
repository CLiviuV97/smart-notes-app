'use client';

import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

interface PdfUploadingProps {
  onCancel: () => void;
}

export function PdfUploading({ onCancel }: PdfUploadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="md" />
      <p className="mt-4 text-sm text-muted-foreground">Analyzing PDF...</p>
      <Button variant="ghost" size="sm" onClick={onCancel} className="mt-4">
        Cancel
      </Button>
    </div>
  );
}
