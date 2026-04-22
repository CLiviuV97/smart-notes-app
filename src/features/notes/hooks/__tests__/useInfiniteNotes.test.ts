import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteNotes } from '../useInfiniteNotes';

const mockUseListNotesQuery = jest.fn();
jest.mock('@/features/notes/api/notesApi', () => ({
  useListNotesQuery: (...args: unknown[]) => mockUseListNotesQuery(...args),
}));

// Mock IntersectionObserver
let observerCallback: IntersectionObserverCallback;
let observerInstance: {
  observe: jest.Mock;
  disconnect: jest.Mock;
  unobserve: jest.Mock;
};

beforeEach(() => {
  observerInstance = {
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  };

  global.IntersectionObserver = jest.fn((callback) => {
    observerCallback = callback;
    return observerInstance as unknown as IntersectionObserver;
  }) as unknown as typeof IntersectionObserver;

  mockUseListNotesQuery.mockReturnValue({
    data: undefined,
    isFetching: false,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useInfiniteNotes', () => {
  it('returns empty notes array initially', () => {
    const { result } = renderHook(() => useInfiniteNotes());
    expect(result.current.notes).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it('returns notes from query data', () => {
    const notes = [
      { id: '1', title: 'Note 1' },
      { id: '2', title: 'Note 2' },
    ];
    mockUseListNotesQuery.mockReturnValue({
      data: { items: notes, nextCursor: null },
      isFetching: false,
    });

    const { result } = renderHook(() => useInfiniteNotes());
    expect(result.current.notes).toEqual(notes);
  });

  it('hasMore is true when nextCursor exists', () => {
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'abc123' },
      isFetching: false,
    });

    const { result } = renderHook(() => useInfiniteNotes());
    expect(result.current.hasMore).toBe(true);
  });

  it('hasMore is false when nextCursor is null', () => {
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: null },
      isFetching: false,
    });

    const { result } = renderHook(() => useInfiniteNotes());
    expect(result.current.hasMore).toBe(false);
  });

  it('creates IntersectionObserver when sentinelRef is attached and nextCursor exists', () => {
    // Start with isFetching: true so effect runs but skips (early return)
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'abc123' },
      isFetching: true,
    });

    const { result, rerender } = renderHook(() => useInfiniteNotes());

    // Attach the ref
    const div = document.createElement('div');
    (result.current.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = div;

    // Now change isFetching to false — deps change → effect re-runs with ref attached
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'abc123' },
      isFetching: false,
    });
    rerender();

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '200px' },
    );
    expect(observerInstance.observe).toHaveBeenCalledWith(div);
  });

  it('updates cursor when sentinel intersects', () => {
    // Start fetching
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'cursor-2' },
      isFetching: true,
    });

    const div = document.createElement('div');
    const { result, rerender } = renderHook(() => useInfiniteNotes());

    (result.current.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = div;

    // Finish fetching — triggers effect
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'cursor-2' },
      isFetching: false,
    });
    rerender();

    // Simulate intersection
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    // After cursor update, the query should be called with the new cursor
    expect(mockUseListNotesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 'cursor-2' }),
    );
  });

  it('does not create observer when isFetching', () => {
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'abc123' },
      isFetching: true,
    });

    renderHook(() => useInfiniteNotes());
    expect(observerInstance.observe).not.toHaveBeenCalled();
  });

  it('disconnects observer on cleanup', () => {
    // Start fetching
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'abc123' },
      isFetching: true,
    });

    const div = document.createElement('div');
    const { result, rerender, unmount } = renderHook(() => useInfiniteNotes());

    (result.current.sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = div;

    // Stop fetching → effect runs
    mockUseListNotesQuery.mockReturnValue({
      data: { items: [{ id: '1' }], nextCursor: 'abc123' },
      isFetching: false,
    });
    rerender();

    expect(observerInstance.observe).toHaveBeenCalled();

    unmount();
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });
});
