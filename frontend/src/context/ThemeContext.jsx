import { createContext, useEffect, useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [themeChangePosition, setThemeChangePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Apply transition class for smooth animation
    root.style.transition = 'background-color 0.7s ease, color 0.7s ease'
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.add('theme-transition')
    } else {
      root.classList.remove('dark')
      root.classList.add('theme-transition')
    }
    
    localStorage.setItem('theme', theme)
    
    // Add enhanced animation CSS if it doesn't exist
    if (!document.getElementById('theme-animations')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'theme-animations'
      styleElement.textContent = `
        .theme-transition * {
          transition: background-color 0.7s ease, 
                      color 0.5s ease, 
                      border-color 0.5s ease, 
                      box-shadow 0.5s ease,
                      transform 0.3s ease;
        }
        
        .theme-transition img, .theme-transition button {
          transition: filter 0.5s ease, transform 0.3s ease;
        }
        
        .theme-ripple {
          position: fixed;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          mix-blend-mode: difference;
          background: rgba(255, 255, 255, 0.85);
          z-index: 9999;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .pulse-animation {
          animation: pulse 3s ease-in-out infinite;
        }
      `
      document.head.appendChild(styleElement)
    }
    
    // Remove transition class after animation completes
    const timeoutId = setTimeout(() => {
      root.classList.remove('theme-transition')
      setIsTransitioning(false)
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [theme])

  const toggleTheme = (e) => {
    // Store click position for ripple effect
    if (e && e.clientX) {
      setThemeChangePosition({ x: e.clientX, y: e.clientY })
    }
    
    setIsTransitioning(true)
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      <div className={theme}>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            className="theme-ripple"
            initial={{ 
              scale: 0,
              x: themeChangePosition.x,
              y: themeChangePosition.y
            }}
            animate={{ 
              scale: [0, 20],
              opacity: [0.8, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
      {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext