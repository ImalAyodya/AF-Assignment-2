import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';

// Setup MSW server
const server = setupServer(
  rest.post('http://localhost:5000/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          _id: '123456',
          username: 'testuser',
          email: 'test@example.com',
          token: 'mock-jwt-token'
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid email or password' })
    );
  }),
  
  rest.post('http://localhost:5000/api/auth/register', (req, res, ctx) => {
    const { email, username, password } = req.body;
    if (email && username && password) {
      return res(
        ctx.status(201),
        ctx.json({
          _id: '654321',
          username,
          email,
          token: 'mock-jwt-token'
        })
      );
    }
    return res(
      ctx.status(400),
      ctx.json({ message: 'Invalid user data' })
    );
  }),
  
  rest.get('http://localhost:5000/api/auth/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader === 'Bearer mock-jwt-token') {
      return res(
        ctx.status(200),
        ctx.json({
          _id: '123456',
          username: 'testuser',
          email: 'test@example.com'
        })
      );
    }
    return res(ctx.status(401));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

beforeEach(() => {
  // Clear localStorage
  localStorage.clear();
  vi.clearAllMocks();
});

const TestApp = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Authentication Flow', () => {
  it('allows users to login successfully', async () => {
    const user = userEvent.setup();
    
    render(<TestApp />, { route: '/login' });
    
    // Wait for login form to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    });
    
    // Enter login credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Should redirect to homepage after login
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    });
  });

  it('shows error for invalid login credentials', async () => {
    const user = userEvent.setup();
    
    render(<TestApp />, { route: '/login' });
    
    // Wait for login form to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    });
    
    // Enter invalid login credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('allows users to register a new account', async () => {
    const user = userEvent.setup();
    
    render(<TestApp />, { route: '/register' });
    
    // Wait for registration form to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });
    
    // Fill out registration form
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm your password/i);
    
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Should save token after registration
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    });
  });
});