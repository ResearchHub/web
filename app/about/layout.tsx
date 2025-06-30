import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="grid min-h-screen w-full"
        style={{
          gridTemplateColumns: '70px minmax(0, 1fr)',
        }}
      >
        {/* Main Left Sidebar - 70px fixed width (minimized) */}
        <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
          <MainLeftSidebar forceMinimize={true} />
        </div>

        {/* Main Content Area */}
        <main className="relative">{children}</main>
      </div>
    </div>
  );
}
