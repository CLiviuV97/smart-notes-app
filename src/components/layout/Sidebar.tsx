'use client';

import { SidebarHeader } from './SidebarHeader';
import { SidebarActions } from './SidebarActions';
import { SidebarSearch } from './SidebarSearch';
import { SidebarNotesList } from './SidebarNotesList';
import { SidebarFooter } from './SidebarFooter';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-paper">
      <SidebarHeader />
      <div className="space-y-2 p-3">
        <SidebarActions onClose={onClose} />
        <SidebarSearch />
      </div>
      <SidebarNotesList onClose={onClose} />
      <SidebarFooter />
    </div>
  );
}
