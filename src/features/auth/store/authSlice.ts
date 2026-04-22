import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SerializedUser, AuthStatus } from '@/types/api';

interface AuthState {
  user: SerializedUser | null;
  status: AuthStatus;
  error: string | null;
  idToken: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  idToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SerializedUser>) {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
    },
    setIdToken(state, action: PayloadAction<string | null>) {
      state.idToken = action.payload;
    },
    setLoading(state) {
      state.status = 'loading';
    },
    setError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
      state.idToken = null;
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectAuthStatus: (state) => state.status,
    selectIdToken: (state) => state.idToken,
    selectIsAuthenticated: (state) => state.status === 'authenticated',
  },
});

export const { setUser, setIdToken, setLoading, setError, clearAuth } =
  authSlice.actions;
export const { selectUser, selectAuthStatus, selectIdToken, selectIsAuthenticated } =
  authSlice.selectors;
export default authSlice.reducer;
