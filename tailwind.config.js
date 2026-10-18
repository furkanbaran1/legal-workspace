/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd7ff',
          300: '#8ebeff',
          400: '#599aff',
          500: '#2f72f5',
          600: '#1a52e0',
          700: '#163dbf',
          800: '#17349c',
          900: '#19307d',
          950: '#121d4d',
        },
        accent: {
          50: '#fffaeb',
          100: '#fff0c6',
          200: '#ffdf88',
          300: '#ffc84a',
          400: '#ffab1f',
          500: '#f5840a',
          600: '#d96106',
          700: '#b54408',
          800: '#91360e',
          900: '#762d0f',
        },
        neutral: {
          25: '#fcfcfd',
          50: '#f8f9fb',
          100: '#eff1f5',
          200: '#dde1e9',
          300: '#c2c8d3',
          400: '#9ba3b3',
          500: '#717c91',
          600: '#596074',
          700: '#484e5e',
          800: '#3d424f',
          900: '#363a45',
          950: '#25282f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
