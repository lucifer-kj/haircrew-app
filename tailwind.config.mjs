const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        'touch': '44px', // Minimum recommended touch target size
      },
    },
  },
  plugins: [],
}

export default config
