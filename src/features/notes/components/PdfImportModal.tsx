'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Sparkles, Tag, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/useToast';
import { useExtractPdfMutation, useCreateNoteMutation } from '@/features/notes/api/notesApi';
import { useAppDispatch } from '@/store';
import { setSelectedNote } from '@/features/notes/store/notesUiSlice';
import type { ExtractedPdf } from '@/types/pdf';

type Stage = 'idle' | 'uploading' | 'preview' | 'saving';
type ViewMode = 'sections' | 'fulltext';

interface PdfImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfImportModal({ open, onOpenChange }: PdfImportModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [extractPdf] = useExtractPdfMutation();
  const [createNote] = useCreateNoteMutation();

  const [stage, setStage] = useState<Stage>('idle');
  const [extracted, setExtracted] = useState<ExtractedPdf | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [sections, setSections] = useState<{ heading: string; content: string }[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('sections');

  const reset = useCallback(() => {
    setStage('idle');
    setExtracted(null);
    setTitle('');
    setContent('');
    setSummary('');
    setTags([]);
    setHighlights([]);
    setSections([]);
    setViewMode('sections');
  }, []);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) reset();
      onOpenChange(isOpen);
    },
    [onOpenChange, reset],
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setStage('uploading');
      try {
        const result = await extractPdf(file).unwrap();
        setExtracted(result);
        setTitle(result.title);
        setContent(result.content);
        setSummary(result.summary);
        setTags(result.tags);
        setHighlights(result.highlights);
        setSections(result.sections);
        setStage('preview');
      } catch (err) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? 'Failed to extract PDF';
        toast({ title: 'PDF Import Error', description: message, variant: 'error' });
        setStage('idle');
      }
    },
    [extractPdf, toast],
  );

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setStage('saving');
    try {
      const finalContent =
        viewMode === 'sections'
          ? sections.map((s) => `## ${s.heading}\n\n${s.content}`).join('\n\n')
          : content;

      const note = await createNote({
        title: title.trim() || 'Untitled',
        content: finalContent,
        summary: summary || null,
        tags: tags.length > 0 ? tags : undefined,
        aiGeneratedAt: new Date().toISOString(),
      }).unwrap();
      toast({ title: 'Note created', description: 'PDF content saved as a new note.' });
      dispatch(setSelectedNote(note.id));
      router.push(`/notes/${note.id}`);
      handleClose(false);
    } catch {
      toast({
        title: 'Save failed',
        description: 'Could not create note. Please try again.',
        variant: 'error',
      });
      setStage('preview');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: handleDrop,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast({ title: 'File too large', description: 'PDF exceeds 10MB limit', variant: 'error' });
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
    disabled: stage !== 'idle',
  });

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
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
            {/* Idle: Dropzone */}
            {stage === 'idle' && (
              <div
                {...getRootProps()}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50',
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF, or click to browse'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Max 10MB, up to 20 pages</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded-full border border-border px-2 py-0.5">AI Summary</span>
                  <span className="rounded-full border border-border px-2 py-0.5">Auto Tags</span>
                  <span className="rounded-full border border-border px-2 py-0.5">
                    Key Highlights
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5">
                    Smart Sections
                  </span>
                </div>
                <p className="mt-2 max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground/70">
                  AI analyzes your PDF and extracts a summary, tags, key highlights, and organized
                  sections — ready to save as a note.
                </p>
              </div>
            )}

            {/* Uploading */}
            {stage === 'uploading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="md" />
                <p className="mt-4 text-sm text-muted-foreground">Analyzing PDF...</p>
              </div>
            )}

            {/* Preview */}
            {stage === 'preview' && extracted && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="pdf-title"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Title
                  </label>
                  <input
                    id="pdf-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Summary */}
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Summary
                  </div>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    maxLength={300}
                    className="w-full resize-none rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Key Highlights */}
                {highlights.length > 0 && (
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Key Highlights
                    </div>
                    <ul className="space-y-1">
                      {highlights.map((h, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content area with tab toggle */}
                <div>
                  <div className="mb-2 flex items-center gap-1 rounded-md bg-muted/50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('sections')}
                      className={cn(
                        'flex-1 rounded px-3 py-1 text-xs font-medium transition-colors',
                        viewMode === 'sections'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Sections
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('fulltext')}
                      className={cn(
                        'flex-1 rounded px-3 py-1 text-xs font-medium transition-colors',
                        viewMode === 'fulltext'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Full Text
                    </button>
                  </div>

                  {viewMode === 'sections' ? (
                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                      {sections.map((section, i) => (
                        <details key={i} className="group rounded-md">
                          <summary className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50">
                            {section.heading}
                          </summary>
                          <div className="px-2 pb-2 pt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                            {section.content}
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      id="pdf-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      className="max-h-64 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>

                {/* Metadata bar */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {extracted.pageCount} {extracted.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                  <span>{extracted.extractedChars.toLocaleString()} characters</span>
                </div>

                {extracted.warnings.length > 0 && (
                  <div className="rounded-md bg-warning/10 p-3 text-xs text-warning">
                    {extracted.warnings.map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => reset()}>
                    Discard
                  </Button>
                  <Button onClick={handleSave}>Save as Note</Button>
                </div>
              </div>
            )}

            {/* Saving */}
            {stage === 'saving' && (
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
