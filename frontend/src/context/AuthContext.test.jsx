import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Create a test component that uses the AuthContext
const TestComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <div data-testid="user-info">{user ? user.username : 'No User'}</div>
      <button 
        data-testid="login-button" 
        onClick={() => login({ user: { username: 'testuser', email: 'test@example.com' }, token: 'test-token' })}
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock fetch for token validation
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'testuser', email: 'test@example.com' })
      })
    );
  });

  it('should default to unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
  });

  it('should authenticate user on login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('should remove authentication on logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // First login
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });
    
    // Then logout
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-button'));
    });
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should check token validity on initialization', async () => {
    // Set a token in localStorage before rendering
    localStorage.setItem('token', 'valid-token');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });
    });
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
  });
});