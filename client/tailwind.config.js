/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct CSS variable bindings strictly matching requested :root
        primary: {
          DEFAULT: 'var(--primary, #1E4252)',
          dark: 'var(--primary-dark, #193847)',
          light: 'var(--primary-light, #1B3C50)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #C3FF01)',
          hover: 'var(--secondary-hover, #A8DF00)',
          soft: 'var(--secondary-soft, #DCE5CE)',
        },
        surface: {
          DEFAULT: 'var(--surface, #FFFFFF)',
          dark: 'var(--surface-dark, #0F161D)',
        },
        card: {
          dark: 'var(--surface-dark, #0F161D)',
        },
        heading: 'var(--heading, #0F161D)',
        bodyText: 'var(--text, #30383D)',
        muted: 'var(--muted, #777F83)',
        textLight: 'var(--text-light, #FFFFFF)',
        clubBorder: 'var(--border, #D0D8D8)',
        success: 'var(--success, #27864A)',
        error: 'var(--error, #D94343)',

        // Forest palette strictly mapped to primary & dark brand colors
        forest: {
          50: '#F1F5F7',
          100: '#E0E9ED',
          200: '#C3D5DC',
          300: '#9EBBC7',
          400: '#6E96A9',
          500: '#4B798F',
          600: '#2E5A6F',
          700: '#1B3C50', // --primary-light
          800: '#1E4252', // --primary
          900: '#193847', // --primary-dark
          950: '#0F161D', // --surface-dark / --heading
        },

        // Gold palette mapped to electric accent colors (--secondary)
        gold: {
          50: '#F9FDED',
          100: '#DCE5CE', // --secondary-soft
          200: '#E4FA87',
          300: '#D6F847',
          400: '#C3FF01', // --secondary
          500: '#C3FF01', // --secondary
          600: '#A8DF00', // --secondary-hover
          700: '#8AB800',
          800: '#6E9300',
          900: '#557200',
          950: '#283600',
        },

        // Cream palette mapped to backgrounds and border
        cream: {
          50: '#FFFFFF',  // --background
          100: '#F1F2F3', // --background-alt
          200: '#E6E8E9',
          300: '#D0D8D8', // --border
          400: '#B5BDBD',
          500: '#98A3A3',
        },
      },
      fontFamily: {
        serif: ['"Montserrat"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(15, 22, 29, 0.08), 0 4px 10px -2px rgba(15, 22, 29, 0.04)',
        'premium-lg': '0 20px 40px -10px rgba(15, 22, 29, 0.16), 0 8px 16px -4px rgba(15, 22, 29, 0.08)',
        'volt': '0 10px 25px -5px rgba(195, 255, 1, 0.35)',
      }
    },
  },
  plugins: [],
};
