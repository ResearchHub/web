import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';

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
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
