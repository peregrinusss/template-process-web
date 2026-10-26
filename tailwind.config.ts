import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#0079C1',
          50: '#e6f2fa',
          600: '#0068a6',
          700: '#005487',
        },
        ink: {
          DEFAULT: '#0A2240',
          50: '#f4f6fa',
          100: '#e3e8f0',
          200: '#b9c4d4',
          300: '#8e9bb0',
          400: '#5f6f87',
          500: '#3e4f68',
        },
        accent: '#E4002B',
        line: '#E3E8F0',
        page: '#F1F4F9',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,34,64,0.04), 0 8px 24px -12px rgba(10,34,64,0.10)',
        bar: '0 12px 40px -12px rgba(10,34,64,0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
