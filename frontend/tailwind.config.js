/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mindflow: {
          bg: '#f8fafc',
          card: '#ffffff',
          primary: '#3b82f6',
          'primary-light': '#eff6ff',
          leaf: '#10b981',
          'leaf-light': '#ecfdf5',
          purple: '#8b5cf6',
          'purple-light': '#f5f3ff',
          peach: '#f97316',
          'peach-light': '#fff7ed',
          amber: '#f59e0b',
          'amber-light': '#fef3c7',
          rose: '#ef4444',
          'rose-light': '#fef2f2',
          border: '#f1f5f9',
          'border-dark': '#e2e8f0',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'soft-hover': '0 8px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
