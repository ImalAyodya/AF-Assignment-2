import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ExplorePage = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [region, setRegion] = useState('all')

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        const url = region !== 'all' 
          ? `https://restcountries.com/v3.1/region/${region}`
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
  }, [region])

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'africa', label: 'Africa' },
    { value: 'americas', label: 'Americas' },
    { value: 'asia', label: 'Asia' },
    { value: 'europe', label: 'Europe' },
    { value: 'oceania', label: 'Oceania' }
  ]

  if (loading) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-xl">Loading explorer data...</p>
    </div>
  )

  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-xl text-red-500">Error: {error}</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Interactive Country Explorer</h1>
      
      <div className="mb-8 flex justify-center">
        <div className="inline-flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1">
          {regions.map(r => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                region === r.value 
                  ? 'bg-white dark:bg-neutral-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {countries.map(country => (
          <div 
            key={country.cca3}
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
          >
            <Link to={`/country/${country.cca3}`}>
              <div className="h-48 overflow-hidden">
                <img 
                  src={country.flags.png} 
                  alt={`Flag of ${country.name.common}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{country.name.common}</h2>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <p><span className="font-medium">Capital:</span></p>
                  <p>{country.capital?.[0] || 'N/A'}</p>
                  
                  <p><span className="font-medium">Population:</span></p>
                  <p>{country.population.toLocaleString()}</p>
                  
                  <p><span className="font-medium">Region:</span></p>
                  <p>{country.region}</p>
                  
                  <p><span className="font-medium">Subregion:</span></p>
                  <p>{country.subregion || 'N/A'}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExplorePage
