import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  selectors: {
    selectSelectedNoteId: (state) => state.selectedNoteId,
    selectSearchQuery: (state) => state.searchQuery,
  },
});

export const { setSelectedNote, setEditorDirty, setSearchQuery, setFilterTags } =
  notesUiSlice.actions;
export const { selectSelectedNoteId, selectSearchQuery } = notesUiSlice.selectors;

export default notesUiSlice.reducer;
