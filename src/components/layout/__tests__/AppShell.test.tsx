import { render, screen } from '@testing-library/react';

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
});
