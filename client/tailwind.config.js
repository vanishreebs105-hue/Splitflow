/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F7F8F5',
          100: '#EBEEE6',
          200: '#D6DCC9',
          300: '#B8C2A4',
          400: '#8E9E78',
          500: '#4A5D3A',
          600: '#3D4C30',
          700: '#303D26',
          800: '#232D1C',
          900: '#161D12',
        },
        olive: {
          50: '#F7F8F5',
          100: '#EFF1EB',
          200: '#DCE0D2',
          300: '#B8C2A4',
          400: '#8E9E78',
          500: '#5F7048',
          600: '#4A5D3A',
          700: '#3D4C30',
          800: '#303D26',
          900: '#232D1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 20px -4px rgb(0 0 0 / 0.08), 0 2px 6px -1px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}