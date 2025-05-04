import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import HomePage from '../pages/HomePage';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

// Mock data
const mockSearchResults = [
  {
    name: { common: 'France', official: 'French Republic' },
    cca3: 'FRA',
    flags: { png: 'france-flag.png', svg: 'france-flag.svg' },
    capital: ['Paris'],
    region: 'Europe',
    population: 67391582
  },
  {
    name: { common: 'Finland', official: 'Republic of Finland' },
    cca3: 'FIN',
    flags: { png: 'finland-flag.png', svg: 'finland-flag.svg' },
    capital: ['Helsinki'],
    region: 'Europe',
    population: 5530719
  }
];

// Setup MSW server to intercept requests
const server = setupServer(
  rest.get('https://restcountries.com/v3.1/name/:name', (req, res, ctx) => {
    const name = req.params.name;
    if (name === 'fr') {
      return res(ctx.status(200), ctx.json(mockSearchResults.filter(c => c.name.common.toLowerCase().includes('fr'))));
    }
    return res(ctx.status(404), ctx.json({ message: 'Not found' }));
  }),
  
  rest.get('https://restcountries.com/v3.1/all', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockSearchResults));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

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

describe('Country Search Flow', () => {
  it('allows users to search for countries and shows results', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<HomePage />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/discover our world/i)).toBeInTheDocument();
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    
    // Type in the search query
    await user.type(searchInput, 'fr');
    
    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    // Should display search results
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    
    // Should have Paris as capital
    expect(screen.getByText(/paris/i)).toBeInTheDocument();
  });

  it('handles no results for search', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<HomePage />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/discover our world/i)).toBeInTheDocument();
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    
    // Type in a query that won't match
    await user.type(searchInput, 'nonexistent');
    
    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    // Should handle no results gracefully
    await waitFor(() => {
      expect(screen.queryByText('nonexistent')).not.toBeInTheDocument();
    });
  });
});