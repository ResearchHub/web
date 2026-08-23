import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'The Substation',
    description:
      "The 49ers lead the league in injuries. Some blame the electrical substation next to Levi's Stadium. Until now, no one has studied it. Fund the research.",
    url: '/pool/substation',
    image: '/pool/substation/og.jpg',
  }),
  title: {
    default: 'The Substation',
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function SubstationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
