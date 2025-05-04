import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/layout/AnimatedPage'
import CountryMap from '../components/CountryMap';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { countryService } from '../services/countryService';

const CountryDetailsPage = () => {
  const { countryCode } = useParams()
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Reset state when countryCode changes
    setLoading(true);
    setError(null);
    setCountry(null);
  }, [countryCode]);

  useEffect(() => {
    const fetchCountryDetails = async () => {
      try {
        setLoading(true)
        console.log('Fetching country with code:', countryCode);
        
        const data = await countryService.getCountryByCode(countryCode);
        console.log('Country data received:', data);
        
        if (!data || data.length === 0) {
          throw new Error('No country data found');
        }
        
        const [countryData] = data;
        setCountry(countryData);
        
        // Check if country is in favorites
        if (isAuthenticated) {
          try {
            const token = localStorage.getItem('token');
            console.log('Checking favorites with token:', token ? 'Token exists' : 'No token');
            
            const checkFav = await fetch(`http://localhost:5000/api/favorites/check/${countryCode}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('Favorites check status:', checkFav.status);
            
            if (checkFav.ok) {
              const favData = await checkFav.json();
              console.log('Favorite data:', favData);
              setIsFavorite(favData.isFavorite);
            }
          } catch (favError) {
            console.error('Error checking favorites:', favError);
            // Continue without setting favorite status
          }
        }
      } catch (err) {
        console.error('Error in fetchCountryDetails:', err);
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCountryDetails()
  }, [countryCode, isAuthenticated])
  
  useEffect(() => {
    if (loading) {
      // Set a timeout to prevent infinite loading state
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout reached');
        setLoading(false);
        if (!country && !error) {
          setError('Loading took too long. Please try again.');
        }
      }, 10000); // 10 second timeout
  
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [loading, country, error]);
  
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!country) {
      console.error("Cannot toggle favorite: country data is missing");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No auth token found");
        navigate('/login');
        return;
      }
      
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = isFavorite 
        ? `http://localhost:5000/api/favorites/${countryCode}` 
        : 'http://localhost:5000/api/favorites';
        
      console.log(`Sending ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: !isFavorite ? JSON.stringify({
          countryCode,
          name: country.name.common,
          flag: country.flags.png
        }) : null
      });
      
      console.log('Toggle favorite response:', response.status);
      
      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error toggling favorite:", errorData);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  if (loading) return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-xl">Loading country details...</p>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mt-8 animate-spin"></div>
        </motion.div>
      </div>
    </AnimatedPage>
  )

  if (error) return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.p 
          className="text-xl text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Error: {error}
        </motion.p>
        <motion.button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Back
        </motion.button>
      </div>
    </AnimatedPage>
  )

  return (
    <AnimatedPage>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.button 
          onClick={() => navigate(-1)} 
          className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 flex items-center gap-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
        
        {!country && !loading && !error && (
          <div className="text-center py-16">
            <p className="text-xl text-red-500">No country data found</p>
            <motion.button 
              onClick={() => navigate('/countries')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Countries
            </motion.button>
          </div>
        )}
        
        {country && (
          // Existing country detail UI
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 sm:space-y-6"
            >
              <motion.img 
                src={country.flags.svg} 
                alt={`Flag of ${country.name.common}`}
                className="w-full h-auto rounded-lg shadow-md"
                initial={{ filter: 'blur(10px)' }}
                animate={{ filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              />
              
              {/* Map with responsive height - add null check */}
              {country && country.latlng && Array.isArray(country.latlng) && country.latlng.length >= 2 && (
                <motion.div 
                  className="rounded-lg overflow-hidden shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-lg font-medium mb-2">Map Location</h3>
                  <CountryMap 
                    lat={country.latlng[0]} 
                    lng={country.latlng[1]} 
                    country={country.name.common}
                    className="h-48 sm:h-56 md:h-64 w-full rounded-md overflow-hidden"
                    zoom={window.innerWidth < 768 ? 2 : 4}
                  />
                </motion.div>
              )}
            </motion.div>
            
            {/* Rest of country details with responsive text sizing */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <motion.h1 
                  className="text-2xl sm:text-3xl font-bold"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {country.name.common}
                </motion.h1>
                
                {/* Add favorite button */}
                <motion.button
                  className="p-2"
                  onClick={toggleFavorite}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isFavorite ? (
                    <FaHeart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                  ) : (
                    <FaRegHeart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-300" />
                  )}
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-sm sm:text-base">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <p><span className="font-semibold">Official Name:</span> {country.name.official}</p>
                  <p><span className="font-semibold">Population:</span> {country.population.toLocaleString()}</p>
                  <p><span className="font-semibold">Region:</span> {country.region}</p>
                  <p><span className="font-semibold">Sub Region:</span> {country.subregion || 'N/A'}</p>
                  <p><span className="font-semibold">Capital:</span> {country.capital?.[0] || 'N/A'}</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <p><span className="font-semibold">Top Level Domain:</span> {country.tld?.[0] || 'N/A'}</p>
                  <p>
                    <span className="font-semibold">Currencies:</span>{' '}
                    {country.currencies 
                      ? Object.values(country.currencies).map(currency => currency.name).join(', ') 
                      : 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Languages:</span>{' '}
                    {country.languages 
                      ? Object.values(country.languages).join(', ') 
                      : 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Area:</span>{' '}
                    {country.area ? `${country.area.toLocaleString()} km²` : 'N/A'}
                  </p>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold mb-3">Border Countries:</h2>
                <div className="flex flex-wrap gap-2">
                  {country.borders?.length ? (
                    country.borders.map((border, index) => (
                      <motion.div
                        key={border}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
                        whileHover={{ scale: 1.1, backgroundColor: '#3b82f6', color: 'white' }}
                      >
                        <Link 
                          to={`/country/${border}`}
                          className="px-4 py-1 bg-white dark:bg-neutral-800 shadow-sm rounded-md text-sm block"
                        >
                          {border}
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <p>No bordering countries</p>
                  )}
                </div>
              </motion.div>

              {/* Add this button near the country details: */}
              {isAuthenticated ? (
                <motion.button
                  onClick={toggleFavorite}
                  className={`flex items-center px-4 py-2 rounded-md text-white ${
                    isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFavorite ? (
                    <>
                      <FaHeart className="mr-2" /> Remove from Favorites
                    </>
                  ) : (
                    <>
                      <FaRegHeart className="mr-2" /> Add to Favorites
                    </>
                  )}
                </motion.button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                >
                  <FaRegHeart className="mr-2" /> Login to Add to Favorites
                </Link>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}

export default CountryDetailsPage