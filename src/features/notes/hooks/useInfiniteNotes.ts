'use client';

import { useState, useRef, useEffect } from 'react';
import { useListNotesQuery } from '@/features/notes/api/notesApi';

export function useInfiniteNotes() {
  const [cursor, setCursor] = useState<string | undefined>();
  const { data, isFetching } = useListNotesQuery({ cursor, limit: 20 });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !data?.nextCursor || isFetching) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCursor(data.nextCursor!);
      },
      { rootMargin: '200px' },
    );

    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [data?.nextCursor, isFetching]);

  return {
    notes: data?.items ?? [],
    sentinelRef,
    isFetching,
    hasMore: !!data?.nextCursor,
  };
}
