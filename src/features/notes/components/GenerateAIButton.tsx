'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useGenerateAISummaryMutation } from '@/features/notes/api/notesApi';
import { useToast } from '@/components/ui/useToast';
import { Button } from '@/components/ui/Button';

interface GenerateAIButtonProps {
  noteId: string;
}

export function GenerateAIButton({ noteId }: GenerateAIButtonProps) {
  const [generate, { isLoading }] = useGenerateAISummaryMutation();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleGenerate = async () => {
    try {
      const result = await generate(noteId).unwrap();
      setShowSuccess(true);
      if (result._aiWarning) {
        toast({
          variant: 'warning',
          title: 'Content was truncated',
          description: result._aiWarning,
        });
      }
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
      <Button variant="ghost" size="sm" disabled className="bg-ok/10 text-ok hover:bg-ok/10">
        <Check className="h-3.5 w-3.5" />
        Done
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleGenerate}
      loading={isLoading}
      className="bg-accent-wash text-accent hover:bg-accent/15"
    >
      {!isLoading && <Sparkles className="h-3.5 w-3.5" />}
      {isLoading ? 'Generating...' : 'AI Summary'}
    </Button>
  );
}
