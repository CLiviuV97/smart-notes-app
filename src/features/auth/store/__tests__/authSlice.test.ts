import authReducer, {
  setUser,
  setIdToken,
  setLoading,
  setError,
  clearAuth,
  selectUser,
  selectAuthStatus,
  selectIdToken,
  selectIsAuthenticated,
} from '../authSlice';
import type { SerializedUser } from '@/types/api';

const mockUser: SerializedUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

describe('authSlice', () => {
  const initialState = authReducer(undefined, { type: '@@INIT' });

  it('has correct initial state', () => {
    expect(initialState).toEqual({
      user: null,
      status: 'idle',
      error: null,
      idToken: null,
    });
  });

  it('setLoading transitions to loading', () => {
    const state = authReducer(initialState, setLoading());
    expect(state.status).toBe('loading');
  });

  it('setUser transitions to authenticated', () => {
    const loading = authReducer(initialState, setLoading());
    const state = authReducer(loading, setUser(mockUser));
    expect(state.user).toEqual(mockUser);
    expect(state.status).toBe('authenticated');
    expect(state.error).toBeNull();
  });

  it('setError transitions to error', () => {
    const loading = authReducer(initialState, setLoading());
    const state = authReducer(loading, setError('Something went wrong'));
    expect(state.status).toBe('error');
    expect(state.error).toBe('Something went wrong');
  });

  it('setIdToken stores token', () => {
    const state = authReducer(initialState, setIdToken('my-token'));
    expect(state.idToken).toBe('my-token');
  });

  it('clearAuth resets to unauthenticated', () => {
    let state = authReducer(initialState, setUser(mockUser));
    state = authReducer(state, setIdToken('token'));
    state = authReducer(state, clearAuth());
    expect(state).toEqual({
      user: null,
      status: 'unauthenticated',
      error: null,
      idToken: null,
    });
  });

  describe('selectors', () => {
    const rootState = {
      auth: authReducer(initialState, setUser(mockUser)),
    };

    it('selectUser returns user', () => {
      expect(selectUser({ auth: rootState.auth })).toEqual(mockUser);
    });

    it('selectAuthStatus returns status', () => {
      expect(selectAuthStatus({ auth: rootState.auth })).toBe('authenticated');
    });

    it('selectIdToken returns token', () => {
      const withToken = {
        auth: authReducer(rootState.auth, setIdToken('tok')),
      };
      expect(selectIdToken({ auth: withToken.auth })).toBe('tok');
    });

    it('selectIsAuthenticated returns true when authenticated', () => {
      expect(selectIsAuthenticated({ auth: rootState.auth })).toBe(true);
    });

    it('selectIsAuthenticated returns false when idle', () => {
      expect(selectIsAuthenticated({ auth: initialState })).toBe(false);
    });
  });
});
