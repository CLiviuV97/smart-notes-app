'use client';

import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { Spinner } from '@/components/ui/Spinner';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, shouldRender } = useAuthRedirect({
    require: 'unauthenticated',
    redirectTo: '/notes',
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

  return <>{children}</>;
}
