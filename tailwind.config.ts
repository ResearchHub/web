import type { Config } from 'tailwindcss';
import { colors } from './app/styles/colors';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        gray: colors.gray,
      },
      screens: {
        wide: '1200px',
        '3xl': '1600px',
      },
      fontWeight: {
        medium: '500',
        large: '550',
        semibold: '600',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.3)' },
        },
        'radiate-circle': {
          '0%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(2)' },
          '100%': { opacity: '0', transform: 'scale(3)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        radiate: 'radiate-circle 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
