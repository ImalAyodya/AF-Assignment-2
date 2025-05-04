import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from '../components/layout/AnimatedPage';

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user's favorites
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

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

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div 
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Hello, {user?.username || 'User'}</h1>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
            </div>
            <motion.button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Your Favorite Countries</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md">
                {error}
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {favorites.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    You haven't added any countries to your favorites yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {favorites.map(favorite => (
                      <motion.div
                        key={favorite.countryCode}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-gray-50 dark:bg-neutral-700 rounded-lg shadow overflow-hidden"
                      >
                        <img 
                          src={favorite.flag} 
                          alt={`Flag of ${favorite.name}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold">{favorite.name}</h3>
                          <div className="flex mt-2 justify-between">
                            <motion.button
                              onClick={() => navigate(`/country/${favorite.countryCode}`)}
                              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              whileHover={{ x: 2 }}
                            >
                              View Details
                            </motion.button>
                            <motion.button
                              className="text-red-500 text-sm hover:text-red-700 dark:hover:text-red-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={async () => {
                                const token = localStorage.getItem('token');
                                await fetch(`http://localhost:5000/api/favorites/${favorite.countryCode}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });
                                setFavorites(favorites.filter(f => f.countryCode !== favorite.countryCode));
                              }}
                            >
                              Remove
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <motion.div 
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Update your password regularly for security</p>
                </div>
                <motion.button
                  className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert('Password change functionality to be implemented')}
                >
                  Change Password
                </motion.button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <h3 className="font-medium">Email Preferences</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage your email notification settings</p>
                </div>
                <motion.button
                  className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert('Email preferences functionality to be implemented')}
                >
                  Update Preferences
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default ProfilePage;