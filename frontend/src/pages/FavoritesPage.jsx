import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/layout/AnimatedPage';
import { useAuth } from '../context/AuthContext';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      // Check authentication status first
      if (!isAuthenticated) {
        // Don't redirect immediately - wait for auth context to initialize
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          // Token expired or invalid
          throw new Error('Authentication expired. Please login again.');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add a short delay to ensure auth context is fully initialized
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/favorites' } });
      } else {
        fetchFavorites();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Favorite Countries</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl mb-6">You haven't added any favorites yet.</p>
                <Link 
                  to="/countries" 
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition"
                >
                  Browse Countries
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((country) => (
                  <motion.div
                    key={country.countryCode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden"
                  >
                    <Link to={`/country/${country.countryCode}`}>
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={country.flag} 
                          alt={`Flag of ${country.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h2 className="text-lg font-bold mb-2">{country.name}</h2>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`http://localhost:5000/api/favorites/${country.countryCode}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            if (response.ok) {
                              setFavorites(favorites.filter(f => f.countryCode !== country.countryCode));
                            }
                          } catch (err) {
                            console.error('Error removing favorite:', err);
                          }
                        }}
                        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                      >
                        Remove from Favorites
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  );
};

export default FavoritesPage;