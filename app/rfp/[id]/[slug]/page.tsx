import { Metadata } from 'next';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { GrantContentSwitcher } from '@/components/Funding/GrantContentSwitcher';
import { getRfpPageData } from './getRfpPageData';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const { work, metadata } = await getRfpPageData(id);
  return getWorkMetadata({
    work,
    grant: metadata.grant,
    url: `/rfp/${id}/${slug}`,
  });
}

export default async function GrantSlugPage({ params }: Props) {
  const { id } = await params;
  const { work, metadata } = await getRfpPageData(id);

  return (
    <GrantContentSwitcher
      content={work.previewContent}
      showProposalFilters={Boolean(metadata.grant?.description)}
    />
  );
}
