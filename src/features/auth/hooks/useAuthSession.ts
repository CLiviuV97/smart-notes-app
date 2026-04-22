import { useAppSelector } from '@/store';
import {
  selectUser,
  selectAuthStatus,
  selectIdToken,
  selectIsAuthenticated,
} from '@/features/auth/store/authSlice';

export function useAuthSession() {
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);
  const idToken = useAppSelector(selectIdToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    user,
    idToken,
    status,
    isAuthenticated,
    isLoading: status === 'idle' || status === 'loading',
  };
}
