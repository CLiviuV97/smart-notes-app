'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { ToastRoot, ToastTitle, ToastDescription, ToastAction, ToastClose, ToastViewport } from './Toast';
import { ToastContext, useToastReducer } from './useToast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, toast, dismiss } = useToastReducer();

  return (
    <ToastContext value={{ toasts, toast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastRoot
            key={t.id}
            variant={t.variant}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            <div className="grid gap-1">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            {t.action && (
              <ToastAction altText={t.action.label} onClick={t.action.onClick}>
                {t.action.label}
              </ToastAction>
            )}
            <ToastClose />
          </ToastRoot>
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext>
  );
}
