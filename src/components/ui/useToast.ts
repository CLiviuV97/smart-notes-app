'use client';

import { createContext, useCallback, useContext, useReducer } from 'react';
import type { ToastVariant } from './Toast';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastAction = { type: 'ADD'; toast: ToastItem } | { type: 'DISMISS'; id: string };

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'DISMISS':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export interface ToastContextValue {
  toasts: ToastItem[];
  toast: (opts: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastReducer() {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', toast: { ...opts, id } });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', id });
  }, []);

  return { toasts, toast, dismiss };
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
