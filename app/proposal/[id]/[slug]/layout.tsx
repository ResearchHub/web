import { Suspense } from 'react';
import { Metadata } from 'next';
import { CommentService } from '@/services/comment.service';
import { buildArticleMetadata } from '@/lib/metadata';
import { getShareToken } from '@/lib/shareToken/server';
import { stripHtml } from '@/utils/stringUtils';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkHeaderProposal, WorkTabProvider } from '@/components/work/WorkHeader/index';
import { ProposalSidebar } from '@/components/work/ProposalSidebar';
import { getProposalMetadata, getProposalOrNotFound } from '@/components/work/proposalRouteServer';
import { RegisteredReportRouteTrackerLoader } from '@/components/work/RegisteredReportRouteTrackerLoader';
import type { RegisteredReportTrackerStep } from '@/types/registeredReport';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  try {
    const [work, shareToken] = await Promise.all([getProposalOrNotFound(id), getShareToken()]);
    const previewText = stripHtml(work.previewContent || '').substring(0, 155);
    const description =
      work.abstract || previewText || 'View this research proposal on ResearchHub.';
    return {
      ...buildArticleMetadata({
        title: work.title,
        description,
        url: `/proposal/${id}/${slug}`,
        image: work.image,
        publishedTime: work.publishedDate || work.createdDate,
        modifiedTime: work.updatedDate,
        authors: work.authors.map((a) => a.authorProfile.fullName),
        section: work.topics[0]?.name,
        tags: work.topics.map((t) => t.name),
      }),
      // A tokenized URL points at a proposal that is private to everyone else.
      ...(shareToken ? { robots: { index: false, follow: false } } : {}),
    };
  } catch {
    return {};
  }
}

export default async function ProposalSlugLayout({ params, children }: Props) {
  const { id } = await params;

  const work = await getProposalOrNotFound(id);

  const [metadata, authorPosts] = await Promise.all([
    getProposalMetadata(work.unifiedDocumentId?.toString() || ''),
    CommentService.fetchAuthorPosts({
      documentId: work.id,
      contentType: work.contentType,
    }),
  ]);
  const trackerWithoutReport: RegisteredReportTrackerStep[] | undefined =
    metadata.fundraising?.status === 'COMPLETED' && !work.registeredReportId
      ? [
          {
            stage: 'grant',
            label: 'Funding Opportunity',
            exists: Boolean(work.linkedGrant?.postId),
            postId: work.linkedGrant?.postId ?? null,
            title: work.linkedGrant?.title ?? work.linkedGrant?.shortTitle ?? null,
          },
          {
            stage: 'proposal',
            label: 'Proposal',
            exists: true,
            postId: work.id,
            title: work.title,
          },
          {
            stage: 'registered_report',
            label: 'Registered Report',
            exists: false,
            postId: null,
            title: null,
          },
        ]
      : undefined;

  return (
    <WorkTabProvider>
      <PageLayout
        topBanner={
          <WorkHeaderProposal
            work={work}
            metadata={metadata}
            updatesCount={authorPosts.length}
            preTitle={
              <RegisteredReportRouteTrackerLoader
                currentStage="proposal"
                currentPostId={work.id}
                registeredReportId={work.registeredReportId}
                trackerWithoutReport={trackerWithoutReport}
              />
            }
          />
        }
        rightSidebar={<ProposalSidebar work={work} metadata={metadata} />}
      >
        <Suspense>{children}</Suspense>
      </PageLayout>
    </WorkTabProvider>
  );
}
