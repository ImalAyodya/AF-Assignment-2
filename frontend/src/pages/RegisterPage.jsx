import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/layout/AnimatedPage';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (data.errors && data.errors[0].msg) || 'Registration failed');
      }

      // Use the login function from context
      login({
        id: data._id,
        username: data.username,
        email: data.email,
      }, data.token);

      // Redirect to home page
      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    visible: {
      opacity: 1,
      y: 0,
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 8px rgba(131, 24, 67, 0.5)" }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          className="w-full max-w-lg p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="text-center" variants={itemVariants}>
            <motion.div
              className="mx-auto h-16 w-16 relative"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 rounded-full opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-yellow-400 rounded-full opacity-60 mix-blend-overlay"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  className="text-3xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                >
                  🌎
                </motion.span>
              </div>
            </motion.div>
            
            <motion.h2 
              className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
              variants={itemVariants}
            >
              Create your account
            </motion.h2>
            <motion.p 
              className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
              variants={itemVariants}
            >
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
          
          {error && (
            <motion.div 
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>{error}</p>
            </motion.div>
          )}
          
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <div className="space-y-5 rounded-md">
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Username
                </label>
                <motion.input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  minLength="3"
                  value={username}
                  onChange={handleChange}
                  whileFocus="focus"
                  variants={inputVariants}
                  className="appearance-none relative block w-full px-3 py-3 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-indigo-500 dark:focus:border-purple-500 dark:bg-neutral-700/50 sm:text-sm"
                  placeholder="Choose a username"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email address
                </label>
                <motion.input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                  whileFocus="focus"
                  variants={inputVariants}
                  className="appearance-none relative block w-full px-3 py-3 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-indigo-500 dark:focus:border-purple-500 dark:bg-neutral-700/50 sm:text-sm"
                  placeholder="Your email address"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <motion.input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength="6"
                  value={password}
                  onChange={handleChange}
                  whileFocus="focus"
                  variants={inputVariants}
                  className="appearance-none relative block w-full px-3 py-3 border border-neutral-300 dark:border-neutral-700 placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-indigo-500 dark:focus:border-purple-500 dark:bg-neutral-700/50 sm:text-sm"
                  placeholder="Create a password (min. 6 characters)"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm Password
                </label>
                <motion.input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  whileFocus="focus"
                  variants={inputVariants}
                  className={`appearance-none relative block w-full px-3 py-3 border ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500' 
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-purple-500 dark:focus:border-purple-500'
                  } placeholder-neutral-500 dark:placeholder-neutral-400 text-neutral-900 dark:text-white rounded-md focus:outline-none dark:bg-neutral-700/50 sm:text-sm`}
                  placeholder="Confirm your password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">Passwords don't match</p>
                )}
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting || (confirmPassword && password !== confirmPassword)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                ) : "Create Account"}
              </motion.button>
            </motion.div>
          </motion.form>
          
          <motion.div 
            className="mt-6 text-center text-sm"
            variants={itemVariants}
          >
            <p className="text-neutral-600 dark:text-neutral-400">
              By registering, you agree to our{' '}
              <Link to="/terms" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default RegisterPage;