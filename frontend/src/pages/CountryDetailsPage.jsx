import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/layout/AnimatedPage'
import CountryMap from '../components/CountryMap';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const CountryDetailsPage = () => {
  const { countryCode } = useParams()
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCountryDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        
        if (!response.ok) {
          throw new Error('Country not found')
        }
        
        const [data] = await response.json()
        setCountry(data)
        
        // Check if country is in favorites
        if (isAuthenticated) {
          const token = localStorage.getItem('token');
          const checkFav = await fetch(`http://localhost:5000/api/favorites/check/${countryCode}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (checkFav.ok) {
            const favData = await checkFav.json();
            setIsFavorite(favData.isFavorite);
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCountryDetails()
  }, [countryCode, isAuthenticated])
  
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = isFavorite 
        ? `http://localhost:5000/api/favorites/${countryCode}` 
        : 'http://localhost:5000/api/favorites';
        
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
      
      if (response.ok) {
        setIsFavorite(!isFavorite);
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
      <div className="container mx-auto px-4 py-8">
        <motion.button 
          onClick={() => navigate(-1)} 
          className="mb-6 px-4 py-2 flex items-center gap-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
        
        {country && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
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
              
              {/* Add map display */}
              {country.latlng && (
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
                    className="h-64 w-full rounded-md overflow-hidden"
                  />
                </motion.div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h1 
                  className="text-3xl font-bold"
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
                    <FaHeart className="h-6 w-6 text-red-500" />
                  ) : (
                    <FaRegHeart className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                  )}
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
            </motion.div>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}

export default CountryDetailsPage