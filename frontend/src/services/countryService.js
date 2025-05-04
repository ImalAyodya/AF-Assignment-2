const API_BASE_URL = 'https://restcountries.com/v3.1';

// Make sure this service exists and properly handles the API calls

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

  // Get country by code
  getCountryByCode: async (code) => {
    try {
      console.log(`Fetching country with code: ${code}`);
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
      
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch country with code: ${code}`);
      }
      
      const data = await response.json();
      console.log('Country data fetched successfully');
      return data;
    } catch (error) {
      console.error(`Error fetching country with code ${code}:`, error);
      
      // Try fallback to v2 API if v3 fails
      try {
        console.log('Trying fallback API...');
        const fallbackResponse = await fetch(`https://restcountries.com/v2/alpha/${code}`);
        if (!fallbackResponse.ok) {
          throw error; // Throw the original error if fallback also fails
        }
        
        const fallbackData = await fallbackResponse.json();
        
        // Convert v2 data to v3 format
        return [{
          name: {
            common: fallbackData.name,
            official: fallbackData.name
          },
          flags: {
            png: fallbackData.flags.png,
            svg: fallbackData.flags.svg
          },
          capital: fallbackData.capital ? [fallbackData.capital] : [],
          region: fallbackData.region,
          subregion: fallbackData.subregion,
          population: fallbackData.population,
          latlng: fallbackData.latlng,
          area: fallbackData.area,
          borders: fallbackData.borders,
          currencies: fallbackData.currencies,
          languages: fallbackData.languages,
          tld: fallbackData.topLevelDomain
        }];
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        throw error;
      }
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
};