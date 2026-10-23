import { Suspense } from 'react';
import { Metadata } from 'next';
import { CommentService } from '@/services/comment.service';
import { buildArticleMetadata } from '@/lib/metadata';
import { getShareToken } from '@/lib/shareToken/server';
import { stripHtml } from '@/utils/stringUtils';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkHeaderProposal, WorkTabProvider } from '@/components/work/WorkHeader/index';
import { FundPanelProvider } from '@/components/Funding/FundPanelContext';
import { ProposalSidebar } from '@/components/work/ProposalSidebar';
import { ProposalByline } from '@/components/work/ProposalByline';
import { ProposalTabs } from '@/components/work/ProposalTabs';
import { ProposalActionBar } from '@/components/work/ProposalActionBar';
import { WorkInstitutionProvider } from '@/components/work/WorkInstitutionContext';
import {
  fetchProposalNonprofit,
  getProposalMetadata,
  getProposalOrNotFound,
} from '@/components/work/proposalRouteServer';
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
      }),
      // Tokenized URL — private proposal, keep it out of search indexes.
      ...(shareToken ? { robots: { index: false, follow: false } } : {}),
    };
  } catch {
    return {};
  }
}

export default async function ProposalSlugLayout({ params, children }: Props) {
  const { id } = await params;

  const work = await getProposalOrNotFound(id);

  // The fundraise's nonprofit is looked up as soon as the metadata names the
  // fundraise, alongside the author's updates rather than after them.
  const metadataRequest = getProposalMetadata(work.unifiedDocumentId?.toString() || '');
  const [metadata, authorPosts, nonprofit] = await Promise.all([
    metadataRequest,
    CommentService.fetchAuthorPosts({
      documentId: work.id,
      contentType: work.contentType,
    }),
    // undefined when the lookup failed, as opposed to null for none.
    metadataRequest.then((m) =>
      m.fundraising ? fetchProposalNonprofit(m.fundraising.id).catch(() => undefined) : null
    ),
  ]);
  // A failed lookup is handed over as never looked up rather than as none, so
  // the Fund panel still looks the nonprofit up itself when it opens and keeps
  // its donor-advised fund option. The cover and the byline name the author.
  const nonprofitFundraiseId = nonprofit === undefined ? undefined : metadata.fundraising?.id;
  const trackerWithoutReport: RegisteredReportTrackerStep[] | undefined =
    metadata.fundraising?.status === 'COMPLETED' && !work.registeredReportId
      ? [
          {
            stage: 'grant',
            label: 'Request for Proposal',
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

  // Laid out as the RFP page is: the cover with the tabs across the page under
  // it, then the byline over each tab's content, with the funding card in the
  // sidebar and a Fund bar where the sidebar is hidden.
  return (
    <WorkTabProvider>
      <FundPanelProvider>
        <WorkInstitutionProvider fundraiseId={nonprofitFundraiseId} nonprofit={nonprofit ?? null}>
          <PageLayout
            contentWidth="narrow"
            // The funding card's top lines up with the byline's.
            rightSidebarTopOffset="aligned"
            rightSidebarBare
            topBanner={
              <WorkHeaderProposal
                work={work}
                metadata={metadata}
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
            pageTabs={
              <ProposalTabs work={work} metadata={metadata} updatesCount={authorPosts.length} />
            }
            rightSidebar={<ProposalSidebar work={work} metadata={metadata} />}
          >
            <ProposalByline work={work} metadata={metadata} />
            <Suspense>{children}</Suspense>
            {metadata.fundraising && <ProposalActionBar fundraise={metadata.fundraising} />}
          </PageLayout>
        </WorkInstitutionProvider>
      </FundPanelProvider>
    </WorkTabProvider>
  );
}
