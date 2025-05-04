import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { countryService } from './countryService';

describe('Country Service', () => {
  const mockCountryData = [
    {
      name: { common: 'France', official: 'French Republic' },
      cca3: 'FRA',
      flags: { png: 'france-flag.png', svg: 'france-flag.svg' },
      capital: ['Paris'],
      region: 'Europe',
      population: 67391582
    }
  ];

  beforeEach(() => {
    // Setup fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch all countries successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountryData
    });

    const result = await countryService.getAllCountries();
    
    expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
    expect(result).toEqual(mockCountryData);
  });

  it('should handle errors when fetching all countries', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(countryService.getAllCountries()).rejects.toThrow('Failed to fetch countries');
  });

  it('should fetch country by code successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockCountryData
    });

    const result = await countryService.getCountryByCode('FRA');
    
    expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v3.1/alpha/FRA');
    expect(result).toEqual(mockCountryData);
  });

  it('should try fallback API when primary API fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        name: 'France',
        flags: { png: 'france-flag.png', svg: 'france-flag.svg' },
        capital: 'Paris',
        region: 'Europe',
        population: 67391582,
        latlng: [46, 2],
        subregion: 'Western Europe',
        topLevelDomain: ['.fr']
      })
    });

    const result = await countryService.getCountryByCode('FRA');
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v3.1/alpha/FRA');
    expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v2/alpha/FRA');
    expect(result[0].name.common).toEqual('France');
  });

  it('should fetch countries by region successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountryData
    });

    const result = await countryService.getCountriesByRegion('europe');
    
    expect(global.fetch).toHaveBeenCalledWith('https://restcountries.com/v3.1/region/europe');
    expect(result).toEqual(mockCountryData);
  });
});