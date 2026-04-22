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
      <Button variant="ghost" size="sm" disabled>
        <Check className="h-4 w-4 text-green-500" />
        Done
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" loading={isLoading} onClick={handleGenerate}>
      {!isLoading && <Sparkles className="h-4 w-4" />}
      {isLoading ? 'Generating...' : 'Generate Summary'}
    </Button>
  );
}
