import { render, screen } from '@testing-library/react';
import { SkeletonNoteCard, SkeletonNoteCardList } from '../SkeletonNoteCard';

describe('SkeletonNoteCard', () => {
  it('renders without crash', () => {
    render(<SkeletonNoteCard />);
    expect(screen.getByTestId('skeleton-note-card')).toBeInTheDocument();
  });

  it('renders skeleton elements', () => {
    render(<SkeletonNoteCard />);
    expect(screen.getByTestId('skeleton-note-card')).toBeInTheDocument();
  });
});

describe('SkeletonNoteCardList', () => {
  it('renders default count of 5 cards', () => {
    render(<SkeletonNoteCardList />);
    expect(screen.getAllByTestId('skeleton-note-card')).toHaveLength(5);
  });

  it('renders specified count of cards', () => {
    render(<SkeletonNoteCardList count={3} />);
    expect(screen.getAllByTestId('skeleton-note-card')).toHaveLength(3);
  });
});
