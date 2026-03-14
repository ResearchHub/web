import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { GrantContentSwitcher } from '@/components/Funding/GrantContentSwitcher';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getGrant(id: string) {
  if (!id.match(/^\d+$/)) {
    notFound();
  }
  try {
    return await PostService.get(id);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const grant = await getGrant(id);
  return getWorkMetadata({
    work: grant,
    url: `/grant/${id}/${slug}`,
  });
}

export default async function GrantSlugPage({ params }: Props) {
  const { id } = await params;
  const work = await getGrant(id);

  const grant = work.note?.post?.grant;
  const grantId = grant?.id ?? undefined;

  return (
    <GrantContentSwitcher
      content={work.previewContent}
      imageUrl={work.image}
      hasDescription={!!grant?.description}
      grantId={grantId}
    >
      <FundraiseProvider grantId={grantId ? Number(grantId) : undefined}>
        {grant?.description && <ProposalSortAndFilters />}
        <ProposalFeed />
      </FundraiseProvider>
    </GrantContentSwitcher>
  );
}
