import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/layout/AnimatedPage'

const CountriesPage = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { regionName } = useParams()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

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
          <p className="text-xl">Loading countries...</p>
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
      </div>
    </AnimatedPage>
  )

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {regionName ? `Countries in ${regionName}` : 'All Countries'}
        </motion.h1>
        
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <input
            type="text"
            placeholder="Search for a country..."
            className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCountries.map(country => (
            <motion.div 
              key={country.cca3}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Link 
                to={`/country/${country.cca3}`}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition block h-full"
              >
                <div className="h-40 overflow-hidden">
                  <motion.img 
                    src={country.flags.png} 
                    alt={`Flag of ${country.name.common}`}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2">{country.name.common}</h2>
                  <p><span className="font-medium">Population:</span> {country.population.toLocaleString()}</p>
                  <p><span className="font-medium">Region:</span> {country.region}</p>
                  <p><span className="font-medium">Capital:</span> {country.capital?.[0] || 'N/A'}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredCountries.length === 0 && (
          <motion.p 
            className="text-center my-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No countries found matching your search.
          </motion.p>
        )}
      </div>
    </AnimatedPage>
  )
}

export default CountriesPage