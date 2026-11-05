import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { LeftSidebarContainer } from '@/app/layouts/components/LeftSidebarContainer';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Endowment',
    description:
      'Earn Funding Credits on your ResearchCoin deposits. Daily yield to direct toward open-science research proposals.',
    url: '/endowment',
  }),
  title: {
    default: 'Endowment',
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function EndowmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* The landing page keeps its own top bar and footer, so it stays outside
          PageLayout; the app's left column is mounted directly to preserve
          continuity with the rest of the app. Passing `isOpen={false}` leaves
          it off-canvas below 1240px, where this page has no menu button to
          open it. */}
      <LeftSidebarContainer isOpen={false} />
      <main className="relative min-w-0 flex-1">{children}</main>
    </div>
  );
}
