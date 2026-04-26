'use client';

import { Search } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSearchQuery, selectSearchQuery } from '@/features/notes/store/notesUiSlice';

export function SidebarSearch() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
      <input
        type="search"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="h-9 w-full rounded-[7px] border border-rule-2 bg-paper-2 pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}
