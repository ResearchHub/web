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
        // Sweeps `bg-text-shine` through text clipped to the glyphs. The held
        // frames at each end pause the band off the word, so it reads as a
        // repeating pulse rather than a continuous scroll.
        'text-shine': {
          '0%, 18%': { backgroundPosition: '100% 0' },
          '82%, 100%': { backgroundPosition: '0% 0' },
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
        'text-shine': 'text-shine 2.25s cubic-bezier(0.25, 0.1, 0.25, 1) infinite',
      },
      backgroundImage: {
        // Paired with `animate-text-shine` and `bg-clip-text`. Sized to 300% so
        // the band starts and ends clear of the text. Callers set `--shine` to
        // the label's own color (it can't be `currentColor` — the element's
        // color is transparent so the clipped gradient can show through); the
        // band is that same color faded rather than a lighter one, so it
        // composites over whatever surface the label sits on.
        'text-shine': `linear-gradient(90deg,
          var(--shine) 0%, var(--shine) 30%,
          color-mix(in srgb, var(--shine) 30%, transparent) 45%,
          color-mix(in srgb, var(--shine) 30%, transparent) 55%,
          var(--shine) 70%, var(--shine) 100%)`,
      },
    },
  },
} satisfies Config;
