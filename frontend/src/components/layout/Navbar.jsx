import { Link, useLocation } from 'react-router-dom'
import { useContext, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeContext from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext';

// Add these styles to your CSS file or use styled-components
const styleContent = `
  .backface-hidden {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  
  .rotateY-180 {
    transform: rotateY(180deg);
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-pulse-slow {
    animation: pulse 3s infinite;
  }
`;

const Navbar = () => {
  // Add this effect to inject the styles
  useEffect(() => {
    if (!document.getElementById('navbar-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'navbar-styles';
      styleElement.textContent = styleContent;
      document.head.appendChild(styleElement);
      
      return () => {
        const element = document.getElementById('navbar-styles');
        if (element) element.remove();
      };
    }
  }, []);
  
  const { theme, toggleTheme, isTransitioning } = useContext(ThemeContext)
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { isAuthenticated, user, logout } = useAuth();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuRef])

  const navbarVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }
  
  // Globe animation for the logo
  const globeAnimation = {
    rotate: [0, -10, 10, -5, 5, 0],
    scale: [1, 1.05, 1, 1.02, 1]
  }
  
  return (
    <>
      <motion.div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'py-3 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-md shadow-lg shadow-purple-900/20' 
            : 'py-5 bg-transparent'
        }`}
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <motion.div 
              className="flex items-center"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div 
                  className="relative overflow-hidden w-10 h-10 flex items-center justify-center"
                  animate={globeAnimation}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut" 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 rounded-full opacity-80"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-yellow-400 rounded-full opacity-60 mix-blend-overlay"></div>
                  <span className="text-xl relative z-10">🌎</span>
                </motion.div>
                
                <div>
                  <motion.h1 
                    className="font-bold text-transparent text-xl bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-300"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {scrolled ? 'C.Explorer' : 'Countries Explorer'}
                  </motion.h1>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <motion.div 
              className="hidden md:flex items-center space-x-1"
              variants={navbarVariants}
            >
              <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 shadow-inner shadow-white/5">
                <NavItem to="/" label="Home" currentPath={location.pathname} />
                <NavItem to="/countries" label="Countries" currentPath={location.pathname} />
                <NavItem to="/explore" label="Explore" currentPath={location.pathname} />
                <NavItem to="/about" label="About" currentPath={location.pathname} />
              </div>
              
              {/* Authentication buttons */}
              <div className="hidden md:flex items-center ml-4 space-x-2">
                {isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-3"
                  >
                    <Link
                      to="/profile"
                      className="text-sm font-medium text-white hover:text-white/90 transition"
                    >
                      {user?.username || 'Profile'}
                    </Link>
                    <motion.button
                      onClick={() => {
                        logout();
                        window.location.href = '/';
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Logout
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex space-x-2"
                  >
                    <Link to="/login">
                      <motion.button
                        className="px-4 py-1.5 text-white bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Login
                      </motion.button>
                    </Link>
                    <Link to="/register">
                      <motion.button
                        className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full text-sm font-medium text-white transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Register
                      </motion.button>
                    </Link>
                  </motion.div>
                )}
              </div>
              
              {/* Theme Toggle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                className="ml-3"
              >
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.9 }}
                  className="relative h-10 w-10 rounded-full overflow-hidden"
                  aria-label="Toggle theme"
                >
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ 
                      rotateY: theme === 'light' ? 0 : 180,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Light Theme Side */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center backface-hidden">
                      <span className="text-lg">☀️</span>
                    </div>
                    {/* Dark Theme Side */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center rotateY-180 backface-hidden">
                      <span className="text-lg">🌙</span>
                    </div>
                  </motion.div>
                  
                  {/* Animation on theme change */}
                  {isTransitioning && (
                    <motion.div 
                      className="absolute inset-0 z-10"
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className={`w-full h-full rounded-full ${theme === 'light' ? 'bg-yellow-400/30' : 'bg-indigo-500/30'}`}></div>
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Mobile Menu Button */}
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button 
                className="flex items-center p-2" 
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-6 flex flex-col items-end space-y-1">
                  <motion.span 
                    animate={menuOpen ? { rotate: 45, y: 6, width: '100%' } : { rotate: 0, y: 0 }}
                    className={`block h-0.5 ${menuOpen ? 'w-6' : 'w-6'} bg-white rounded`}
                  ></motion.span>
                  <motion.span 
                    animate={menuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block h-0.5 w-4 bg-white rounded"
                  ></motion.span>
                  <motion.span 
                    animate={menuOpen ? { rotate: -45, y: -6, width: '100%' } : { rotate: 0, y: 0 }}
                    className={`block h-0.5 ${menuOpen ? 'w-6' : 'w-5'} bg-white rounded`}
                  ></motion.span>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            ref={menuRef}
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
            <motion.div
              className="absolute right-0 top-0 h-full w-2/3 max-w-xs bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 shadow-xl overflow-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-6 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button 
                    className="text-white p-2" 
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <MobileNavItem to="/" label="Home" onClick={() => setMenuOpen(false)} />
                  <MobileNavItem to="/countries" label="Countries" onClick={() => setMenuOpen(false)} />
                  <MobileNavItem to="/explore" label="Explore" onClick={() => setMenuOpen(false)} />
                  <MobileNavItem to="/about" label="About" onClick={() => setMenuOpen(false)} />
                  
                  {/* Add authentication links */}
                  {!isAuthenticated ? (
                    <>
                      <div className="border-t border-white/10 my-2"></div>
                      <MobileNavItem to="/login" label="Login" onClick={() => setMenuOpen(false)} />
                      <MobileNavItem to="/register" label="Register" onClick={() => setMenuOpen(false)} />
                    </>
                  ) : (
                    <>
                      <div className="border-t border-white/10 my-2"></div>
                      <MobileNavItem to="/profile" label="Profile" onClick={() => setMenuOpen(false)} />
                      <div 
                        className="block p-3 rounded-lg text-white hover:bg-white/10 cursor-pointer"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          window.location.href = '/';
                        }}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">👋</span>
                          Logout
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Switch theme</span>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center"
                      aria-label="Toggle theme"
                    >
                      <div className="relative w-12 h-6 bg-purple-800 rounded-full">
                        <motion.div
                          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                          animate={{
                            x: theme === 'light' ? 0 : 24
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        ></motion.div>
                      </div>
                      <span className="ml-2 text-white">{theme === 'light' ? '☀️' : '🌙'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Desktop Nav Item with improved selection visibility
const NavItem = ({ to, label, currentPath }) => {
  const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to))
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      <Link 
        to={to}
        className={`
          relative px-4 py-2 inline-block rounded-full text-sm font-medium transition-all duration-300
          ${isActive 
            ? 'text-white font-bold' // Bolder text when active
            : 'text-white hover:text-white/90'  // Always white text
          }
        `}
      >
        {isActive && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-pink-500/80 to-cyan-500/80 rounded-full -z-10"
            layoutId="activeNavBackground"
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          />
        )}
        <span className="relative z-10">{label}</span>
        
        {/* Add underline indicator for active items */}
        {isActive && (
          <motion.div 
            className="absolute h-0.5 bg-white bottom-0.5 left-0 right-0 mx-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  )
}

// Mobile Nav Item with improved visibility
const MobileNavItem = ({ to, label, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
  
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link 
        to={to} 
        className={`
          block p-3 rounded-lg transition-colors
          ${isActive 
            ? 'bg-white/20 text-white font-bold' // More visible background and bolder text
            : 'text-white hover:bg-white/10'  // Always white text with hover effect
          }
        `}
        onClick={onClick}
      >
        <div className="flex items-center">
          {/* Icon mapping */}
          <span className="mr-3">
            {to === '/' && '🏠'}
            {to === '/countries' && '🌍'}
            {to === '/explore' && '🔍'}
            {to === '/about' && 'ℹ️'}
          </span>
          {label}
          {isActive && (
            <motion.div
              className="ml-auto"
              animate={{ x: [5, 0] }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default Navbar;