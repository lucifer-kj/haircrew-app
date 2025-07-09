const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './store/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        accent: 'var(--accent)',
      },
      borderRadius: {
        xl: '0.75rem', // from design.json
        '2xl': '1rem',
        full: '9999px',
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
        headings: [
          'Poppins',
          'Inter',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config; 