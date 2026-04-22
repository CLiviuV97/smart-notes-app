import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../ToastProvider';
import { useToast } from '../useToast';

function TestConsumer() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast({ title: 'Success!' })}>Show toast</button>
      <button onClick={() => toast({ variant: 'error', title: 'Error!', action: { label: 'Retry', onClick: jest.fn() } })}>
        Show error
      </button>
    </div>
  );
}

describe('Toast system', () => {
  it('renders toast when toast() is called', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show toast'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders error variant toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show error'));
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
