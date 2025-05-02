import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, PolarArea } from 'react-chartjs-2';
import AnimatedPage from '../components/layout/AnimatedPage';
import { countryService } from '../services/countryService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCountries, setFeaturedCountries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  
  // Regions for quick filtering
  const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  useEffect(() => {
    // Fetch featured countries and chart data from the API
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured countries
        const featuredNames = ['japan', 'new zealand', 'morocco', 'norway'];
        
        const promises = featuredNames.map(name => 
          fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`)
            .then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        
        // Format data for display
        const formatted = results.map((result, index) => {
          const country = result[0];
          return {
            id: index + 1,
            name: country.name.common,
            cca3: country.cca3,
            image: country.flags.png,
            region: country.region,
            population: country.population,
            description: `${country.name.common} - ${country.capital?.[0] || 'No capital'}, Pop: ${country.population.toLocaleString()}`
          };
        });
        
        setFeaturedCountries(formatted);
        
        // Fetch all countries for chart data
        const allCountries = await countryService.getAllCountries();
        prepareChartData(allCountries);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Transform API data into chart-friendly format
  const prepareChartData = (countries) => {
    // Population by Region
    const regionData = {};
    const populationByRegion = {};
    const languagesData = {};
    const topPopulatedCountries = [...countries]
      .sort((a, b) => b.population - a.population)
      .slice(0, 10);
      
    // Process region data
    countries.forEach(country => {
      const region = country.region;
      if (region) {
        regionData[region] = (regionData[region] || 0) + 1;
        populationByRegion[region] = (populationByRegion[region] || 0) + country.population;
        
        // Process language data
        if (country.languages) {
          Object.values(country.languages).forEach(language => {
            languagesData[language] = (languagesData[language] || 0) + 1;
          });
        }
      }
    });
    
    // Create chart data objects
    const formattedChartData = {
      regionDistribution: {
        labels: Object.keys(regionData),
        datasets: [
          {
            label: 'Number of Countries',
            data: Object.values(regionData),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      },
      populationByRegion: {
        labels: Object.keys(populationByRegion),
        datasets: [
          {
            label: 'Population (millions)',
            data: Object.values(populationByRegion).map(pop => pop / 1000000),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      },
      topPopulatedCountries: {
        labels: topPopulatedCountries.map(country => country.name.common),
        datasets: [
          {
            label: 'Population (millions)',
            data: topPopulatedCountries.map(country => country.population / 1000000),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      topLanguages: {
        labels: Object.keys(languagesData).slice(0, 8),
        datasets: [
          {
            label: 'Number of Countries',
            data: Object.values(languagesData).slice(0, 8),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(201, 203, 207, 0.7)',
              'rgba(94, 114, 228, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      },
    };
    
    setChartData(formattedChartData);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${searchQuery}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.slice(0, 5)); // Limit to 5 results
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching countries:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const heroTextVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.8
      }
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          color: theme => theme.color === 'dark' ? '#fff' : '#333'
        }
      },
      tooltip: {
        bodyFont: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme => theme.color === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
        grid: {
          color: theme => theme.color === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: theme => theme.color === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
        grid: {
          color: theme => theme.color === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen">
        {/* Hero Section with Motion - Keep as is */}
        <div className="relative h-screen"> {/* Set a specific height */}
          <motion.div 
            className="absolute inset-0"
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              className="h-full w-full object-cover brightness-50"
              alt="World panorama"
            />
          </motion.div>
          <div className="relative max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
            <motion.h1 
              className="ml-95 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-display"
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
            >
              Discover Our World
            </motion.h1>
            <motion.p 
              className="mt-6 text-xl text-white max-w-3xl mx-auto"
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              Explore countries, cultures, and wonders from around the globe.
            </motion.p>

            {/* Search Bar with Animation */}
            <motion.div 
              className="mt-10 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex rounded-md shadow-lg">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 flex-grow block w-full rounded-l-md text-neutral-900 border-neutral-300 px-4 py-3"
                  placeholder="Search for a country..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : "Search"}
                </motion.button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <motion.div 
                  className="mt-2 bg-white dark:bg-neutral-800 rounded-md shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {searchResults.map(country => (
                    <Link to={`/country/${country.cca3}`} key={country.cca3}>
                      <motion.div 
                        className="p-3 border-b border-gray-200 dark:border-neutral-700 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                      >
                        <img 
                          src={country.flags.png} 
                          alt={`Flag of ${country.name.common}`} 
                          className="w-8 h-6 object-cover"
                        />
                        <div>
                          <p className="font-medium">{country.name.common}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {country.region} • {country.capital?.[0] || 'No capital'}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Chart Section - New */}
        {chartData && (
          <motion.div 
            className="bg-white dark:bg-neutral-900 py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2 
                className="text-3xl font-bold font-display mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Global Insights
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Population by Region Chart */}
                <motion.div 
                  className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Population by Region</h3>
                  <div className="h-80">
                    <Bar 
                      options={chartOptions} 
                      data={chartData.populationByRegion} 
                    />
                  </div>
                </motion.div>
                
                {/* Region Distribution Chart */}
                <motion.div 
                  className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Region Distribution</h3>
                  <div className="h-80 flex justify-center">
                    <div className="w-full max-w-md">
                      <Pie
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: theme => theme.color === 'dark' ? '#fff' : '#333'
                              }
                            }
                          }
                        }} 
                        data={chartData.regionDistribution} 
                      />
                    </div>
                  </div>
                </motion.div>
                
                {/* Top 10 Populated Countries */}
                <motion.div 
                  className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Top 10 Most Populated Countries</h3>
                  <div className="h-80">
                    <Bar 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            ...chartOptions.plugins.legend,
                            display: false,
                          }
                        },
                      }} 
                      data={chartData.topPopulatedCountries} 
                    />
                  </div>
                </motion.div>
                
                {/* Top Languages */}
                <motion.div 
                  className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Most Common Languages</h3>
                  <div className="h-80">
                    <PolarArea 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              color: theme => theme.color === 'dark' ? '#fff' : '#333'
                            }
                          }
                        }
                      }} 
                      data={chartData.topLanguages} 
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Featured Countries Section - Keep existing code */}
        {/* ... existing featured countries section ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h2 
            className="text-3xl font-bold text-neutral-900 dark:text-white font-display"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Countries
          </motion.h2>
          
          <motion.div 
            className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {loading ? (
              // Loading placeholders
              [...Array(4)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden"
                  initial={{ opacity: 0.6 }}
                  animate={{ 
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="h-48 w-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="p-6">
                    <div className="h-6 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
                    <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              featuredCountries.map((country) => (
                <motion.div 
                  key={country.id} 
                  className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  variants={itemVariants}
                  whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                >
                  <div className="h-48 w-full overflow-hidden">
                    <motion.img 
                      src={country.image} 
                      alt={country.name} 
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        {country.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                        {country.region}
                      </span>
                    </div>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-sm">
                      {country.description}
                    </p>
                    <div className="mt-4">
                      <motion.div
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to={`/country/${country.cca3}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center"
                        >
                          Explore
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Browse by Region Section - Keep existing code */}
        {/* ... existing browse by region section ... */}
        <motion.div 
          className="bg-neutral-100 dark:bg-neutral-900 py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl font-bold text-neutral-900 dark:text-white font-display"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Browse by Region
            </motion.h2>
            
            <motion.div 
              className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {regions.map((region, index) => (
                <motion.div
                  key={region}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`/region/${region.toLowerCase()}`}
                    className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow text-center block transform transition border-2 border-transparent hover:border-blue-400"
                  >
                    <motion.h3 
                      className="text-lg font-medium text-neutral-900 dark:text-white"
                      whileHover={{ color: "#3b82f6" }}
                    >
                      {region}
                    </motion.h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action Section - Keep existing code */}
        {/* ... existing CTA section ... */}
        <motion.div 
          className="bg-blue-700 dark:bg-blue-800"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <motion.h2 
              className="text-3xl font-extrabold tracking-tight text-white font-display sm:text-4xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="block">Ready to explore more?</span>
              <span className="block text-blue-200">Start your journey today!</span>
            </motion.h2>
            
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
              <motion.div 
                className="inline-flex rounded-md shadow"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to="/countries"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-neutral-50"
                >
                  View All Countries
                </Link>
              </motion.div>
              
              <motion.div 
                className="inline-flex rounded-md shadow"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                >
                  Explore Interactive Map
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}