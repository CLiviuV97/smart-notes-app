import { render, screen } from '@testing-library/react';
import { SkeletonNoteCard, SkeletonNoteCardList } from '../SkeletonNoteCard';

describe('SkeletonNoteCard', () => {
  it('renders without crash', () => {
    const { container } = render(<SkeletonNoteCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders animate-pulse elements', () => {
    const { container } = render(<SkeletonNoteCard />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});

describe('SkeletonNoteCardList', () => {
  it('renders default count of 5 cards', () => {
    const { container } = render(<SkeletonNoteCardList />);
    const cards = container.querySelectorAll('.rounded-lg.border');
    expect(cards).toHaveLength(5);
  });

  it('renders specified count of cards', () => {
    const { container } = render(<SkeletonNoteCardList count={3} />);
    const cards = container.querySelectorAll('.rounded-lg.border');
    expect(cards).toHaveLength(3);
  });
});
