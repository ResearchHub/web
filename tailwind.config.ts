import type { Config } from "tailwindcss";
import { colors } from './app/styles/colors'

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        gray: colors.gray,
      },
    },
  },
  plugins: [],
} satisfies Config;
