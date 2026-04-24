'use client';

import { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { makeStore } from '@/store';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useErrorReporter } from '@/lib/hooks/useErrorReporter';

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    return setupListeners(store.dispatch);
  }, [store.dispatch]);

  useErrorReporter();

  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
