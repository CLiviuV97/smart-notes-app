import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockGenerate = jest.fn();
const mockToast = jest.fn();

jest.mock('@/features/notes/api/notesApi', () => ({
  useGenerateAISummaryMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockGenerate(...args) }),
    { isLoading: false },
  ],
}));

jest.mock('@/components/ui/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('lucide-react', () => ({
  Sparkles: (props: React.SVGAttributes<SVGElement>) => <svg data-testid="sparkles" {...props} />,
  Check: (props: React.SVGAttributes<SVGElement>) => <svg data-testid="check" {...props} />,
}));

import { GenerateAIButton } from '../GenerateAIButton';

describe('GenerateAIButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows idle state with "Generate Summary" text', () => {
    render(<GenerateAIButton noteId="1" />);
    expect(screen.getByText('Generate Summary')).toBeInTheDocument();
    expect(screen.getByTestId('sparkles')).toBeInTheDocument();
  });

  it('shows success state after generating', async () => {
    mockGenerate.mockResolvedValueOnce({ id: '1', summary: 'A summary' });
    const user = userEvent.setup();

    render(<GenerateAIButton noteId="1" />);
    await user.click(screen.getByText('Generate Summary'));

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('shows error toast on failure', async () => {
    mockGenerate.mockRejectedValueOnce(new Error('fail'));
    const user = userEvent.setup();

    render(<GenerateAIButton noteId="1" />);
    await user.click(screen.getByText('Generate Summary'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
          title: 'Failed to generate summary',
        }),
      );
    });
  });
});
