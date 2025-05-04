import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import CountriesPage from '../pages/CountriesPage';
import CountryDetailsPage from '../pages/CountryDetailsPage';

// Mock data
const mockCountries = [
  {
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
  },
  {
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    cca3: 'DEU',
    flags: { png: 'germany-flag.png', svg: 'germany-flag.svg' },
    capital: ['Berlin'],
    region: 'Europe',
    subregion: 'Western Europe',
    population: 83240525,
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    languages: { deu: 'German' },
    latlng: [51, 9],
    area: 357114,
    tld: ['.de'],
    borders: ['AUT', 'BEL', 'CZE', 'DNK', 'FRA', 'LUX', 'NLD', 'POL', 'CHE']
  }
];

// Setup MSW
const server = setupServer(
  rest.get('https://restcountries.com/v3.1/all', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockCountries));
  }),
  
  rest.get('https://restcountries.com/v3.1/region/:region', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockCountries.filter(c => 
      c.region.toLowerCase() === req.params.region.toLowerCase())
    ));
  }),
  
  rest.get('https://restcountries.com/v3.1/alpha/:code', (req, res, ctx) => {
    const country = mockCountries.find(c => c.cca3 === req.params.code);
    if (country) {
      return res(ctx.status(200), ctx.json([country]));
    }
    return res(ctx.status(404));
  }),
  
  rest.get('http://localhost:5000/api/favorites/check/:code', (req, res, ctx) => {
    // Simulate checking if country is in favorites
    return res(ctx.status(200), ctx.json({ isFavorite: false }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

// Mock components that might cause issues in tests
vi.mock('../components/CountryMap', () => ({
  default: () => <div data-testid="country-map">Map Component</div>
}));

const TestApp = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/country/:countryCode" element={<CountryDetailsPage />} />
          <Route path="/region/:regionName" element={<CountriesPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Country Details Flow', () => {
  it('displays the list of countries and allows navigation to details', async () => {
    window.history.pushState({}, '', '/countries');
    const user = userEvent.setup();
    
    render(<TestApp />);
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('All Countries')).toBeInTheDocument();
    });
    
    // Countries should be displayed
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    
    // Click on a country
    const franceLink = screen.getByText('France').closest('a');
    await user.click(franceLink);
    
    // Should navigate to country details
    await waitFor(() => {
      expect(window.location.pathname).toContain('/country/FRA');
    });
  });
  
  it('renders detailed information about a country', async () => {
    window.history.pushState({}, '', '/country/FRA');
    
    render(<TestApp />);
    
    // Wait for country details to load
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    
    // Should display detailed information
    expect(screen.getByText('French Republic')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('67,391,582')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('Western Europe')).toBeInTheDocument();
    expect(screen.getByText('Euro')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    
    // Should display map
    expect(screen.getByTestId('country-map')).toBeInTheDocument();
    
    // Should display bordering countries
    await waitFor(() => {
      mockCountries[0].borders.forEach(border => {
        expect(screen.getByText(border)).toBeInTheDocument();
      });
    });
  });

  it('shows a message for invalid country codes', async () => {
    window.history.pushState({}, '', '/country/INVALID');
    
    render(<TestApp />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/no country data found/i)).toBeInTheDocument();
    });
    
    // Should provide a way to navigate back
    expect(screen.getByRole('button', { name: /browse all countries/i })).toBeInTheDocument();
  });
});