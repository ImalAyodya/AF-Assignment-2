import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import CountryDetailsPage from '../pages/CountryDetailsPage';
import FavoritesPage from '../pages/FavoritesPage';
import ProfilePage from '../pages/ProfilePage';

// Mock data
const mockCountry = {
  name: { common: 'France', official: 'French Republic' },
  cca3: 'FRA',
  flags: { png: 'france-flag.png', svg: 'france-flag.svg' },
  capital: ['Paris'],
  region: 'Europe',
  subregion: 'Western Europe',
  population: 67391582,
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  languages: { fra: 'French' },
  latlng: [46, 2],
  area: 551695,
  tld: ['.fr'],
  borders: ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE']
};

const mockFavorites = [
  {
    _id: '123456',
    countryCode: 'FRA',
    name: 'France',
    flag: 'france-flag.png',
    user: '789012'
  },
  {
    _id: '234567',
    countryCode: 'DEU',
    name: 'Germany',
    flag: 'germany-flag.png',
    user: '789012'
  }
];

// Setup MSW
const server = setupServer(
  rest.get('https://restcountries.com/v3.1/alpha/:code', (req, res, ctx) => {
    if (req.params.code === 'FRA') {
      return res(ctx.status(200), ctx.json([mockCountry]));
    }
    return res(ctx.status(404));
  }),
  
  rest.get('http://localhost:5000/api/favorites/check/:code', (req, res, ctx) => {
    const isFavorite = req.params.code === 'FRA'; // Only France is favorite
    return res(ctx.status(200), ctx.json({ isFavorite }));
  }),
  
  rest.get('http://localhost:5000/api/favorites', (req, res, ctx) => {
    // Check for auth token
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return res(ctx.status(200), ctx.json(mockFavorites));
    }
    return res(ctx.status(401));
  }),
  
  rest.post('http://localhost:5000/api/favorites', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(201), ctx.json({
      _id: '345678',
      ...body,
      user: '789012'
    }));
  }),
  
  rest.delete('http://localhost:5000/api/favorites/:code', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Favorite removed' }));
  }),
  
  rest.get('http://localhost:5000/api/auth/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader === 'Bearer mock-token') {
      return res(ctx.status(200), ctx.json({
        _id: '789012',
        username: 'testuser',
        email: 'test@example.com'
      }));
    }
    return res(ctx.status(401));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

beforeEach(() => {
  // Setup auth
  localStorage.setItem('token', 'mock-token');
});

// Mock components that might cause issues in tests
vi.mock('../components/CountryMap', () => ({
  default: () => <div data-testid="country-map">Map Component</div>
}));

const TestApp = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/country/:countryCode" element={<CountryDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Favorites Flow', () => {
  it('allows adding a country to favorites from country details page', async () => {
    window.history.pushState({}, '', '/country/FRA');
    const user = userEvent.setup();
    
    render(<TestApp />);
    
    // Wait for country details to load
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    
    // Find the add to favorites button (hearts icon)
    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
    
    // Click to add to favorites
    await user.click(favoriteButton);
    
    // Button should change to "Remove from Favorites"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
    });
  });

  it('shows all user favorites on the favorites page', async () => {
    window.history.pushState({}, '', '/favorites');
    
    render(<TestApp />);
    
    // Wait for favorites to load
    await waitFor(() => {
      expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
    });
    
    // Should display favorite countries
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  // Update the third test - the one for removing favorites 
  it('allows removing countries from favorites', async () => {
    window.history.pushState({}, '', '/favorites');
    const user = userEvent.setup();
    
    // Mock the fetch API specifically for this test to verify removal happens
    const fetchMock = vi.fn(() => 
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ message: 'Favorite removed' })
      })
    );
    
    global.fetch = fetchMock;
    
    render(<TestApp />);
    
    // Wait for favorites to load
    await waitFor(() => {
      expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
    });
    
    // Find and click the remove button for France
    const removeButtons = screen.getAllByRole('button', { name: /remove from favorites/i });
    await user.click(removeButtons[0]);
    
    // Verify the API was called with the correct URL and method
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/favorites/FRA', 
      expect.objectContaining({ 
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
  });

  it('shows favorites in the profile page', async () => {
    window.history.pushState({}, '', '/profile');
    
    render(<TestApp />);
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText(/hello, testuser/i)).toBeInTheDocument();
    });
    
    // Should display favorite countries
    await waitFor(() => {
      expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
    });
    
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });
});