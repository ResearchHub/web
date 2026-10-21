import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { GrantContentSwitcher } from '@/components/Funding/GrantContentSwitcher';
import { GrantActionBar } from '@/components/Funding/GrantActionBar';
import { isDeadlineInFuture } from '@/utils/date';

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
    url: `/rfp/${id}/${slug}`,
  });
}

export default async function GrantSlugPage({ params }: Props) {
  const { id } = await params;
  const work = await getGrant(id);

  const grant = work.note?.post?.grant;
  const isActive =
    grant?.status === 'OPEN' && (grant?.endDate ? isDeadlineInFuture(grant.endDate) : true);

  return (
    <GrantContentSwitcher
      content={work.previewContent}
      facts={{
        awardUsd: grant?.amount.usd,
        openedDate: grant?.startDate || work.publishedDate || work.createdDate,
      }}
      actionBar={
        grant && (
          <GrantActionBar
            grantId={grant.id?.toString()}
            fundingPool={grant.fundingPool ?? null}
            isActive={isActive}
          />
        )
      }
      showProposalFilters={Boolean(grant?.description)}
    />
  );
}
