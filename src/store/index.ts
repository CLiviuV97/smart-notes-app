import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from '@/features/auth/store/authSlice';
import notesUiReducer from '@/features/notes/store/notesUiSlice';
import { notesApi } from '@/features/notes/api/notesApi';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      notesUi: notesUiReducer,
      [notesApi.reducerPath]: notesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(notesApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
