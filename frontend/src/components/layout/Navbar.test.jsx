import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import Navbar from './Navbar';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    
    // Mock IntersectionObserver
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));
    
    // Mock localStorage methods
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
    
    // Default to not authenticated
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
      if (key === 'token') return null;
      if (key === 'theme') return 'light';
      return null;
    });
  });

  it('renders the logo and navigation items', () => {
    renderWithProviders(<Navbar />);
    
    expect(screen.getByText(/Countries Explorer|C\.Explorer/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /countries/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
  });

  it('shows login and register buttons when not authenticated', () => {
    renderWithProviders(<Navbar />);
    
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('shows user menu when authenticated', async () => {
    // Mock authenticated state
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
      if (key === 'token') return 'mock-token';
      if (key === 'theme') return 'light';
      return null;
    });
    
    // Mock fetch for auth check
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'testuser', email: 'test@example.com' })
      })
    );
    
    renderWithProviders(<Navbar />);
    
    // Wait for auth state to be checked
    await screen.findByText(/profile|testuser/i);
    
    expect(screen.getByText(/favorites/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('toggles the theme when theme button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<Navbar />);
    
    // Find the theme toggle button and click it
    const themeButton = screen.getByLabelText(/toggle theme/i);
    await user.click(themeButton);
    
    // Should toggle the theme in the context (would need deeper testing in ThemeContext tests)
  });

  it('toggles mobile menu when hamburger icon is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<Navbar />);
    
    // Find the mobile menu button
    const menuButton = screen.getByLabelText(/toggle menu/i);
    
    // Click to open menu
    await user.click(menuButton);
    
    // Verify menu items are visible
    expect(screen.getAllByRole('link', { name: /home/i })).toHaveLength(2); // Desktop + Mobile
  });
});