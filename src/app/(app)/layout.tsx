'use client';

import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, shouldRender } = useAuthRedirect({
    require: 'authenticated',
    redirectTo: '/login',
  });

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!shouldRender) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
