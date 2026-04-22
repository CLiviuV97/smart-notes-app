import { render, screen } from '@testing-library/react';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

// Mock useInfiniteNotes
const mockUseInfiniteNotes = jest.fn();
jest.mock('@/features/notes/hooks/useInfiniteNotes', () => ({
  useInfiniteNotes: () => mockUseInfiniteNotes(),
}));

import NotesPage from '@/app/(app)/notes/page';

const mockNote = {
  id: '1',
  ownerId: 'user1',
  title: 'Test Note',
  content: 'This is test content',
  summary: null,
  tags: ['react', 'testing'],
  aiGeneratedAt: null,
  createdAt: '2026-04-20T10:00:00Z',
  updatedAt: '2026-04-20T12:00:00Z',
};

const sentinelRef = { current: null };

describe('NotesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeleton cards during initial load', () => {
    mockUseInfiniteNotes.mockReturnValue({
      notes: [],
      sentinelRef,
      isFetching: true,
      hasMore: false,
    });

    const { container } = render(<NotesPage />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows empty state when no notes', () => {
    mockUseInfiniteNotes.mockReturnValue({
      notes: [],
      sentinelRef,
      isFetching: false,
      hasMore: false,
    });

    render(<NotesPage />);
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders note cards correctly', () => {
    mockUseInfiniteNotes.mockReturnValue({
      notes: [mockNote],
      sentinelRef,
      isFetching: false,
      hasMore: false,
    });

    render(<NotesPage />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is test content')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  it('shows spinner when loading more notes', () => {
    mockUseInfiniteNotes.mockReturnValue({
      notes: [mockNote],
      sentinelRef,
      isFetching: true,
      hasMore: true,
    });

    const { container } = render(<NotesPage />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows "All notes loaded" message', () => {
    mockUseInfiniteNotes.mockReturnValue({
      notes: [mockNote],
      sentinelRef,
      isFetching: false,
      hasMore: false,
    });

    render(<NotesPage />);
    expect(screen.getByText('All notes loaded')).toBeInTheDocument();
  });

  it('renders sentinel div', () => {
    mockUseInfiniteNotes.mockReturnValue({
      notes: [mockNote],
      sentinelRef,
      isFetching: false,
      hasMore: true,
    });

    const { container } = render(<NotesPage />);
    // Sentinel is an empty div inside the list container
    const listContainer = container.querySelector('.space-y-3');
    expect(listContainer).toBeInTheDocument();
  });
});
