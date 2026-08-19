import type { Config } from 'tailwindcss';
import { colors } from './app/styles/colors';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['md:max-w-md', 'md:max-w-lg'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        gray: colors.gray,
        rhBlue: colors.rhBlue,
        orcid: colors.orcid,
      },
      screens: {
        mobile: '480px',
        tablet: '768px',
        'sidebar-profile': '1000px',
        'sidebar-compact': '1240px',
        'right-sidebar': '1100px',
        'topbar-hide': '1110px',
        'content-md': '1350px',
        'content-lg': '1440px',
        'content-xl': '1580px',
        wide: '1200px',
        // Funder dashboard: applicant-row key-insights side column needs enough
        // horizontal room to not crowd the title. Below this, insights fall
        // back to a single inline row under the author meta.
        'funder-wide': '1100px',
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
        'logo-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Light streak sweeping across an element. The skew is baked in because
        // the animated transform would otherwise override a skew utility class.
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
          '100%': { transform: 'translateX(420%) skewX(-20deg)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        radiate: 'radiate-circle 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        'logo-marquee': 'logo-marquee 32s linear infinite',
        // Single sweep. `both` keeps the streak parked off-screen during the
        // delay instead of sitting mid-element until it starts.
        shimmer: 'shimmer 1.6s ease-in-out 0.45s both',
      },
    },
  },
} satisfies Config;
