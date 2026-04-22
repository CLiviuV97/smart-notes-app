import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

interface NotesUiState {
  selectedNoteId: string | null;
  isEditorDirty: boolean;
  searchQuery: string;
  filterTags: string[];
}

const initialState: NotesUiState = {
  selectedNoteId: null,
  isEditorDirty: false,
  searchQuery: '',
  filterTags: [],
};

const notesUiSlice = createSlice({
  name: 'notesUi',
  initialState,
  reducers: {
    setSelectedNote(state, action: PayloadAction<string | null>) {
      state.selectedNoteId = action.payload;
    },
    setEditorDirty(state, action: PayloadAction<boolean>) {
      state.isEditorDirty = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilterTags(state, action: PayloadAction<string[]>) {
      state.filterTags = action.payload;
    },
  },
});

export const { setSelectedNote, setEditorDirty, setSearchQuery, setFilterTags } =
  notesUiSlice.actions;

export const selectSelectedNoteId = (state: RootState) => state.notesUi.selectedNoteId;
export const selectIsEditorDirty = (state: RootState) => state.notesUi.isEditorDirty;
export const selectSearchQuery = (state: RootState) => state.notesUi.searchQuery;
export const selectFilterTags = (state: RootState) => state.notesUi.filterTags;

export default notesUiSlice.reducer;
