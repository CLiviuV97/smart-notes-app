'use client';

import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/useToast';
import { PDF_MAX_FILE_SIZE_BYTES, PDF_MAX_FILE_SIZE_MB, PDF_MAX_PAGES } from '@/lib/pdf/constants';

interface PdfDropzoneProps {
  onDrop: (files: File[]) => void;
}

export function PdfDropzone({ onDrop }: PdfDropzoneProps) {
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: PDF_MAX_FILE_SIZE_BYTES,
    multiple: false,
    onDrop,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast({
          title: 'File too large',
          description: `PDF exceeds ${PDF_MAX_FILE_SIZE_MB}MB limit`,
          variant: 'error',
        });
      } else if (error?.code === 'file-invalid-type') {
        toast({ title: 'Invalid file', description: 'File must be a PDF', variant: 'error' });
      } else {
        toast({
          title: 'Upload error',
          description: error?.message ?? 'Invalid file',
          variant: 'error',
        });
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF, or click to browse'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Max {PDF_MAX_FILE_SIZE_MB}MB, up to {PDF_MAX_PAGES} pages
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-0.5">AI Summary</span>
        <span className="rounded-full border border-border px-2 py-0.5">Auto Tags</span>
        <span className="rounded-full border border-border px-2 py-0.5">Key Highlights</span>
        <span className="rounded-full border border-border px-2 py-0.5">Smart Sections</span>
      </div>
      <p className="mt-2 max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground/70">
        AI analyzes your PDF and extracts a summary, tags, key highlights, and organized sections —
        ready to save as a note.
      </p>
    </div>
  );
}
