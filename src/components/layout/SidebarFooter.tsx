'use client';

import { LogOut } from 'lucide-react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { logout } from '@/features/auth/services/authClient';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';

export function SidebarFooter() {
  const { user } = useAuthSession();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex items-center justify-between border-t border-rule px-3 py-2.5">
      <div className="flex items-center gap-2 truncate">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-margin-red text-[11px] font-semibold text-white">
          {initials}
        </div>
        <span className="truncate text-[12px] text-ink-2">{user?.email ?? 'User'}</span>
      </div>
      <div className="flex items-center gap-0.5">
        <ThemeToggle />
        <Button variant="ghost" size="sm" aria-label="Sign out" onClick={() => logout()}>
          <LogOut className="h-4 w-4 text-ink-3" />
        </Button>
      </div>
    </div>
  );
}
