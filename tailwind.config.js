/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './docs/**/*.{md,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a73e8', dark: '#1765cc', darker: '#155eb8' },
        success: '#1d9e75',
        warning: '#f29900',
        error: '#d93025',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'Fira Code', 'monospace'] },
      borderRadius: { sm: '6px', md: '10px', lg: '16px', xl: '24px' },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
