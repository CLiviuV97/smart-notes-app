import { render, screen } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  FileText: (props: React.SVGAttributes<SVGElement>) => (
    <svg data-testid="file-text-icon" {...props} />
  ),
}));

import NotesPage from '@/app/(app)/notes/page';

describe('NotesPage', () => {
  it('shows "Select a note" empty state', () => {
    render(<NotesPage />);
    expect(screen.getByText('Select a note')).toBeInTheDocument();
    expect(
      screen.getByText('Choose a note from the sidebar or create a new one'),
    ).toBeInTheDocument();
  });
});
