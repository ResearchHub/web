import { SITE_CONFIG } from '@/lib/metadata';

export const generateMetadata = () => ({
  title: 'About | ResearchHub',
  description: 'Learn more about ResearchHub, our mission, and the team behind the platform.',
  openGraph: {
    title: 'About | ResearchHub',
    description: 'Learn more about ResearchHub, our mission, and the team behind the platform.',
    url: `${SITE_CONFIG.url}/about`,
    type: 'website',
    images: [SITE_CONFIG.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | ResearchHub',
    description: 'Learn more about ResearchHub, our mission, and the team behind the platform.',
    images: [SITE_CONFIG.ogImage],
  },
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-gray-50">{children}</main>;
}
