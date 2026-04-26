'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // ESC to close + scroll lock
  useEffect(() => {
    if (!isSidebarOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync sidebar state with external route changes
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-[280px] shrink-0 border-r border-rule md:block">
          <Sidebar />
        </aside>

        {/* Mobile drawer overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 animate-fade-in"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="relative z-50 h-full w-[280px] animate-scale-in border-r border-rule">
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main pane */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="flex items-center border-b border-rule px-3 py-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="ml-2 font-serif text-[18px] italic font-semibold text-ink">
              Smart Notes
            </span>
          </div>

          <main id="main-content" className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
