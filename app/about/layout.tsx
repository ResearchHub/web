import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { generateOrganizationStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'About',
    description: 'Learn more about ResearchHub, our mission, and the team behind the platform.',
    url: '/about',
  }),
  title: {
    default: 'About',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  other: {
    'application/ld+json': JSON.stringify(generateOrganizationStructuredData()),
  },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
