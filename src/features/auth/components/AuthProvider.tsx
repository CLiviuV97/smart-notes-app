'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { setUser, setIdToken, clearAuth, setLoading } from '@/features/auth/store/authSlice';
import { onAuthChange, onTokenChange } from '@/features/auth/services/authClient';
import type { SerializedUser } from '@/types/api';
import { notesApi } from '@/features/notes/api/notesApi';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading());

    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const user: SerializedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        dispatch(setUser(user));
      } else {
        dispatch(clearAuth());
        dispatch(notesApi.util.resetApiState());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = onTokenChange(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        dispatch(setIdToken(token));
      } else {
        dispatch(setIdToken(null));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return children;
}
