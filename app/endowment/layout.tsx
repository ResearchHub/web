import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';

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
  return <PageLayout rightSidebar={false}>{children}</PageLayout>;
}
