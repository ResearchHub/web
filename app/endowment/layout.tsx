import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Endowment',
    description: 'RSC staking yield overview and historical performance on ResearchHub.',
    url: '/endowment',
  }),
  title: {
    default: 'Endowment',
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function EndowmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="grid min-h-screen w-full"
        style={{
          gridTemplateColumns: '70px minmax(0, 1fr)',
        }}
      >
        <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
          <MainLeftSidebar forceMinimize={true} />
        </div>
        <main className="relative">{children}</main>
      </div>
    </div>
  );
}
