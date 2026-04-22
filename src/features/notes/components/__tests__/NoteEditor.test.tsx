import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNote = {
  id: '1',
  ownerId: 'user1',
  title: 'Test Note',
  content: 'Test content here',
  summary: null,
  tags: ['react'],
  aiGeneratedAt: null,
  createdAt: '2026-04-20T10:00:00Z',
  updatedAt: '2026-04-20T12:00:00Z',
};

const mockUpdateNote = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve(mockNote) });

jest.mock('@/features/notes/api/notesApi', () => ({
  useGetNoteQuery: (id: string) => ({
    data: mockNote,
    isLoading: false,
  }),
  useUpdateNoteMutation: () => [mockUpdateNote, { isLoading: false }],
}));

jest.mock('@/store', () => ({
  useAppDispatch: () => jest.fn(),
}));

jest.mock('@/features/notes/store/notesUiSlice', () => ({
  setEditorDirty: (v: boolean) => ({ type: 'notesUi/setEditorDirty', payload: v }),
}));

import { NoteEditor } from '../NoteEditor';

describe('NoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders title input and content textarea with note data', () => {
    render(<NoteEditor noteId="1" />);
    const titleInput = screen.getByDisplayValue('Test Note');
    const contentArea = screen.getByDisplayValue('Test content here');
    expect(titleInput).toBeInTheDocument();
    expect(contentArea).toBeInTheDocument();
  });

  it('triggers debounced save on typing', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<NoteEditor noteId="1" />);

    const titleInput = screen.getByDisplayValue('Test Note');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    // Advance past debounce
    jest.advanceTimersByTime(1100);

    expect(mockUpdateNote).toHaveBeenCalled();
  });

  it('shows tags metadata', () => {
    render(<NoteEditor noteId="1" />);
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
