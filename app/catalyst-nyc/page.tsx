import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { handleTrendingRedirect } from '@/utils/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { CatalystSignupTrigger } from '@/components/catalyst/CatalystSignupTrigger';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Catalyst NYC — Join ResearchHub',
    description:
      'Catalyst NYC attendees: join ResearchHub and get $500 in Funding Credits to fund real research. Your credits earn yield daily in the ResearchHub Endowment.',
    url: '/catalyst-nyc',
  }),
  // Event-specific QR landing; keep it out of search results.
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function CatalystNycPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  const resolvedSearchParams = await searchParams;

  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      urlSearchParams.set(key, value[0]);
    }
  });

  handleTrendingRedirect(!!session?.user, urlSearchParams);

  return (
    <>
      <LandingPage />
      <CatalystSignupTrigger />
    </>
  );
}
