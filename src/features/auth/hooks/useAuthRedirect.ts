import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from './useAuthSession';

export function useAuthRedirect({
  require,
  redirectTo,
}: {
  require: 'authenticated' | 'unauthenticated';
  redirectTo: string;
}): { isLoading: boolean; shouldRender: boolean } {
  const { isLoading, isAuthenticated } = useAuthSession();
  const router = useRouter();

  const shouldRedirect =
    !isLoading && (require === 'authenticated' ? !isAuthenticated : isAuthenticated);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  return {
    isLoading,
    shouldRender: !isLoading && !shouldRedirect,
  };
}
