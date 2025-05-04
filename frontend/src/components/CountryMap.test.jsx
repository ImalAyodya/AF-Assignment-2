import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import CountryMap from './CountryMap';

// Mock the Leaflet library
vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => ({
        setView: vi.fn().mockReturnThis(),
        remove: vi.fn(),
        invalidateSize: vi.fn()
      })),
      tileLayer: vi.fn(() => ({
        addTo: vi.fn()
      })),
      marker: vi.fn(() => ({
        addTo: vi.fn(),
        bindPopup: vi.fn().mockReturnThis(),
        openPopup: vi.fn()
      }))
    }
  };
});

// Mock IntersectionObserver
beforeAll(() => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
  
  // Mock ResizeObserver
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
});

describe('CountryMap Component', () => {
  it('renders correctly with valid coordinates', () => {
    const country = {
      name: { common: 'France' },
      latlng: [46, 2]
    };

    render(<CountryMap country={country} />);
    
    // We should see the map wrapper
    expect(screen.getByRole('region', { name: /map/i })).toBeInTheDocument();
  });

  it('displays an error message when coordinates are missing', () => {
    const country = {
      name: { common: 'Invalid Country' },
      // Missing latlng
    };

    render(<CountryMap country={country} />);
    
    // We should see the error message
    expect(screen.getByText('Map coordinates not available')).toBeInTheDocument();
  });

  it('displays an error message when latlng is not an array', () => {
    const country = {
      name: { common: 'Invalid Country' },
      latlng: 'not-an-array'
    };

    render(<CountryMap country={country} />);
    
    expect(screen.getByText('Map coordinates not available')).toBeInTheDocument();
  });

  it('displays an error when latlng array is too short', () => {
    const country = {
      name: { common: 'Invalid Country' },
      latlng: [1] // Only one coordinate
    };

    render(<CountryMap country={country} />);
    
    expect(screen.getByText('Map coordinates not available')).toBeInTheDocument();
  });
});