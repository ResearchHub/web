import { Suspense } from 'react';
import { Metadata } from 'next';
import { buildArticleMetadata } from '@/lib/metadata';
import { stripHtml } from '@/utils/stringUtils';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebarServer, ActivitySidebarSkeleton } from '@/components/Activity';
import { GrantPageProvider } from '@/components/Funding/GrantPageContext';
import { FundPanelProvider } from '@/components/Funding/FundPanelContext';
import { WorkHeaderGrant } from '@/components/work/WorkHeader/index';
import { RegisteredReportRouteTrackerLoader } from '@/components/work/RegisteredReportRouteTrackerLoader';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { GrantSidebar } from '@/components/Funding/GrantSidebar';
import { GrantByline } from '@/components/Funding/GrantByline';
import { GrantTabs } from '@/components/Funding/GrantTabs';
import { GrantActionBar } from '@/components/Funding/GrantActionBar';
import { getRfpPageData } from './getRfpPageData';

interface Props {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { work, metadata } = await getRfpPageData(id);
    const previewText = stripHtml(work.previewContent || '').substring(0, 155);
    const description = work.abstract || previewText || 'View this research grant on ResearchHub.';
    return buildArticleMetadata({
      title: work.title,
      description,
      url: `/rfp/${id}/${work.slug}`,
      image: work.image,
      publishedTime: work.publishedDate || work.createdDate,
      modifiedTime: work.updatedDate,
      expirationTime: metadata.grant?.endDate,
      authors: work.authors.map((a) => a.authorProfile.fullName),
    });
  } catch {
    return {};
  }
}

export default async function GrantSlugLayout({ params, children }: Props) {
  const { id } = await params;

  const { work, metadata } = await getRfpPageData(id);
  const grant = metadata.grant;
  const grantId = grant?.id ?? undefined;
  const grantTitle = grant?.shortTitle || work.title;

  // Laid out as the proposal page is: the cover with the tabs across the
  // page under it, then the byline over each tab's content, with the pool card
  // in the sidebar and an Apply and Fund bar where the sidebar is hidden.
  return (
    <FundPanelProvider>
      <GrantPageProvider
        defaultTab="details"
        grant={grant}
        title={grantTitle}
        imageUrl={work.image}
      >
        <PageLayout
          contentWidth="narrow"
          // The pool card's top lines up with the byline's.
          rightSidebarTopOffset="aligned"
          fundraiseGrantId={grantId ? Number(grantId) : undefined}
          topBanner={
            <WorkHeaderGrant
              work={work}
              metadata={metadata}
              preTitle={
                <RegisteredReportRouteTrackerLoader
                  currentStage="grant"
                  currentPostId={work.id}
                  registeredReportId={work.registeredReportId}
                />
              }
            />
          }
          pageTabs={<GrantTabs />}
          // The sidebar brings its own cards: the pool over the activity. A post
          // without a grant keeps the plain activity list.
          rightSidebarBare={Boolean(grant)}
          rightSidebar={
            grant ? (
              <GrantSidebar currentDocumentId={work.id} />
            ) : (
              <Suspense fallback={<ActivitySidebarSkeleton />}>
                <ActivitySidebarServer
                  grantId={grantId}
                  grantTitle={grantTitle}
                  currentDocumentId={work.id}
                />
              </Suspense>
            )
          }
        >
          <GrantByline openedDate={grant?.startDate || work.publishedDate || work.createdDate} />
          {children}
          <GrantActionBar />
          <SearchHistoryTracker work={work} />
        </PageLayout>
      </GrantPageProvider>
    </FundPanelProvider>
  );
}
