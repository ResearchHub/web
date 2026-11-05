import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/lib/metadata';

// Web app manifest via the App Router file convention. Next.js serves this at
// /manifest.webmanifest and auto-injects <link rel="manifest"> into <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
    ],
  };
}
