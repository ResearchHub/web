import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { buildArticleMetadata } from '@/lib/metadata';
import { stripHtml } from '@/utils/stringUtils';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { isDeadlineInFuture } from '@/utils/date';
import { GrantTabProvider } from '@/components/Funding/GrantPageContent';
import { WorkHeaderGrant } from '@/components/work/WorkHeader/index';

interface Props {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const work = await PostService.get(id);
    const description =
      work.abstract ||
      stripHtml(work.previewContent || '').substring(0, 155) ||
      'View this research grant on ResearchHub.';
    return buildArticleMetadata({
      title: work.title,
      description,
      url: `/grant/${id}/${work.slug}`,
      image: work.image,
      publishedTime: work.publishedDate || work.createdDate,
      modifiedTime: work.updatedDate,
      expirationTime: work.note?.post?.grant?.endDate,
      authors: work.authors.map((a) => a.authorProfile.fullName),
      section: work.topics[0]?.name,
      tags: work.topics.map((t) => t.name),
    });
  } catch {
    return {};
  }
}

export default async function GrantSlugLayout({ params, children }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let work;
  try {
    work = await PostService.get(id);
  } catch {
    notFound();
  }

  const grant = work.note?.post?.grant;
  const grantId = grant?.id ?? undefined;
  const grantTitle = grant?.shortTitle || work.title;
  const isPending = grant?.status === 'PENDING';
  const isActive =
    grant?.status === 'OPEN' && (grant?.endDate ? isDeadlineInFuture(grant.endDate) : true);

  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <GrantTabProvider defaultTab="details">
      <PageLayout
        topBanner={
          <WorkHeaderGrant
            work={work}
            metadata={metadata}
            amountUsd={grant?.amount?.usd}
            grantId={grantId?.toString()}
            isActive={isActive}
            isPending={isPending}
            organization={grant?.organization}
          />
        }
        rightSidebar={
          <Suspense fallback={<ActivitySidebarSkeleton />}>
            <FundingSidebarServer grantId={grantId} grantTitle={grantTitle} />
          </Suspense>
        }
      >
        {children}
      </PageLayout>
    </GrantTabProvider>
  );
}
