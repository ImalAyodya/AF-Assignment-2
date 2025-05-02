const API_BASE_URL = 'https://restcountries.com/v3.1';

export const countryService = {
  // Get all countries
  getAllCountries: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all countries:', error);
      throw error;
    }
  },

  // Search countries by name
  searchCountriesByName: async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/name/${name}`);
      if (!response.ok) {
        if (response.status === 404) return []; // No countries found
        throw new Error('Failed to search countries');
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching countries:', error);
      return []; // Return empty array on error for better UX
    }
  },

  // Get countries by region
  getCountriesByRegion: async (region) => {
    try {
      const response = await fetch(`${API_BASE_URL}/region/${region}`);
      if (!response.ok) throw new Error('Failed to fetch countries by region');
      return await response.json();
    } catch (error) {
      console.error('Error fetching countries by region:', error);
      throw error;
    }
  },

  // Get country details by code
  getCountryByCode: async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/alpha/${code}`);
      if (!response.ok) throw new Error('Failed to fetch country details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching country details:', error);
      throw error;
    }
  }
};