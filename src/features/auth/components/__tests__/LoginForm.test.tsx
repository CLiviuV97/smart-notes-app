import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock authClient
const mockLoginWithEmail = jest.fn();
jest.mock('@/features/auth/services/authClient', () => ({
  loginWithEmail: (...args: unknown[]) => mockLoginWithEmail(...args),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), '12345');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(mockLoginWithEmail).not.toHaveBeenCalled();
  });

  it('calls loginWithEmail and navigates on success', async () => {
    mockLoginWithEmail.mockResolvedValue({});
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    expect(mockPush).toHaveBeenCalledWith('/notes');
  });

  it('shows error message on login failure', async () => {
    const firebaseError = new Error('Firebase error');
    Object.assign(firebaseError, { code: 'auth/invalid-credential' });
    mockLoginWithEmail.mockRejectedValue(firebaseError);

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
