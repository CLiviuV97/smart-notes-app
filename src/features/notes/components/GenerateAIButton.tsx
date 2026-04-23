'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useGenerateAISummaryMutation } from '@/features/notes/api/notesApi';
import { useToast } from '@/components/ui/useToast';

interface GenerateAIButtonProps {
  noteId: string;
}

export function GenerateAIButton({ noteId }: GenerateAIButtonProps) {
  const [generate, { isLoading }] = useGenerateAISummaryMutation();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleGenerate = async () => {
    try {
      await generate(noteId).unwrap();
      setShowSuccess(true);
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to generate summary',
        action: {
          label: 'Retry',
          onClick: () => handleGenerate(),
        },
      });
    }
  };

  if (showSuccess) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 rounded-[6px] bg-ok/10 px-2.5 py-1.5 text-[12px] font-medium text-ok"
      >
        <Check className="h-3.5 w-3.5" />
        Done
      </button>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isLoading}
      className="flex items-center gap-1.5 rounded-[6px] bg-accent-wash px-2.5 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/15 disabled:opacity-50"
    >
      {isLoading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {isLoading ? 'Generating...' : 'AI Summary'}
    </button>
  );
}
