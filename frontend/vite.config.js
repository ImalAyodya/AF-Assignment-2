import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fffa',
          100: '#ccfdf5',
          200: '#99f6e8',
          300: '#66eed8',
          400: '#33e3c8',
          500: '#00d4b4',
          600: '#00a990',
          700: '#007f6c',
          800: '#005448',
          900: '#002a24',
          950: '#001512',
        },
        accent: {
          50: '#f6f2ff',
          100: '#ede5ff',
          200: '#dbcbff',
          300: '#c0a4ff',
          400: '#a37dff',
          500: '#8855ff',
          600: '#6c2dfa',
          700: '#5a14e0',
          800: '#4a11b8',
          900: '#3d0e96',
          950: '#260967',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'navbar': '4rem', // For consistent navbar height spacing
        'navbar-lg': '5rem',
        '18': '4.5rem',
      },
      padding: {
        'content': '1.5rem',
        'content-lg': '2rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      gridTemplateColumns: {
        'auto-fill-cards': 'repeat(auto-fill, minmax(280px, 1fr))',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js',
    css: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  }
})


