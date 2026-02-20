import { Metadata } from 'next';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { GrantPageServer, getGrant } from '../GrantPageServer';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const grant = await getGrant(id);
  return getWorkMetadata({
    work: grant,
    url: `/grant/${id}/${slug}/details`,
    titleSuffix: 'Details',
  });
}

export default async function GrantDetailsPage({ params }: Props) {
  const { id } = await params;
  return <GrantPageServer id={id} defaultTab="overview" />;
}
