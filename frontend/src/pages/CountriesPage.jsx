import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/layout/AnimatedPage'

const CountriesPage = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [imagesLoaded, setImagesLoaded] = useState({})
  const { regionName } = useParams()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        setImagesLoaded({}) // Reset loaded images state when fetching new data
        const url = regionName 
          ? `https://restcountries.com/v3.1/region/${regionName}`
          : 'https://restcountries.com/v3.1/all'
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries')
        }
        
        const data = await response.json()
        setCountries(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [regionName])

  const filteredCountries = countries.filter(country => 
    country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle image load event
  const handleImageLoad = (countryId) => {
    setImagesLoaded(prev => ({ ...prev, [countryId]: true }))
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {regionName ? `Countries in ${regionName}` : 'All Countries'}
        </h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for a country..."
            className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden h-[340px] animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCountries.map(country => (
                <Link 
                  to={`/country/${country.cca3}`} 
                  key={country.cca3}
                  className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full"
                >
                  <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    {/* Background placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">🏳️</span>
                    </div>
                    <img 
                      src={country.flags.png} 
                      alt={`Flag of ${country.name.common}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded[country.cca3] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(country.cca3)}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold mb-2">{country.name.common}</h2>
                    <p><span className="font-medium">Population:</span> {country.population.toLocaleString()}</p>
                    <p><span className="font-medium">Region:</span> {country.region}</p>
                    <p><span className="font-medium">Capital:</span> {country.capital?.[0] || 'N/A'}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {filteredCountries.length === 0 && (
              <p className="text-center my-8 text-lg">No countries found matching your search.</p>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  )
}

export default CountriesPage