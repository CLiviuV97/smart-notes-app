import { render, screen, fireEvent, act } from '@testing-library/react';

let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock the Sidebar to avoid pulling in all its dependencies
jest.mock('../Sidebar', () => ({
  Sidebar: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="sidebar">Sidebar {onClose ? 'mobile' : 'desktop'}</div>
  ),
}));

jest.mock('lucide-react', () => ({
  Menu: (props: React.SVGAttributes<SVGElement>) => <svg data-testid="menu-icon" {...props} />,
  X: (props: React.SVGAttributes<SVGElement>) => <svg data-testid="x-icon" {...props} />,
}));

import { AppShell } from '../AppShell';

describe('AppShell', () => {
  beforeEach(() => {
    mockPathname = '/';
    document.body.style.overflow = '';
  });

  it('renders sidebar', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders skip-to-content link', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    const skipLink = screen.getByText('Skip to content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders main content with correct id', () => {
    render(
      <AppShell>
        <div>Main Content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('closes drawer on ESC key', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    // Open the drawer
    fireEvent.click(screen.getByLabelText('Open sidebar'));

    // Drawer should be open (mobile sidebar visible)
    expect(screen.getAllByTestId('sidebar')).toHaveLength(2);

    // Press ESC
    fireEvent.keyDown(document, { key: 'Escape' });

    // Drawer should be closed
    expect(screen.getAllByTestId('sidebar')).toHaveLength(1);
  });

  it('locks body scroll when drawer is open', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(document.body).toHaveStyle({ overflow: '' });

    // Open the drawer
    fireEvent.click(screen.getByLabelText('Open sidebar'));
    expect(document.body).toHaveStyle({ overflow: 'hidden' });

    // Close the drawer
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body).toHaveStyle({ overflow: '' });
  });

  it('closes drawer on pathname change', () => {
    const { rerender } = render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    // Open the drawer
    fireEvent.click(screen.getByLabelText('Open sidebar'));
    expect(screen.getAllByTestId('sidebar')).toHaveLength(2);

    // Simulate route change
    act(() => {
      mockPathname = '/notes/123';
    });
    rerender(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    // Drawer should be closed
    expect(screen.getAllByTestId('sidebar')).toHaveLength(1);
  });
});
