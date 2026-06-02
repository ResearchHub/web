import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Give',
    description:
      'Give to science. Your gift goes directly to researchers around the world, funding the open, reproducible work that moves humanity forward.',
    url: '/give',
  }),
  title: {
    default: 'Give',
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function GiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
