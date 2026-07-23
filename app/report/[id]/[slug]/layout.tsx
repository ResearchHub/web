import { Metadata } from 'next';
import { buildArticleMetadata } from '@/lib/metadata';
import { stripHtml } from '@/utils/stringUtils';
import { PageLayout } from '@/app/layouts/PageLayout';
import { RegisteredReportSidebar } from '@/components/work/RegisteredReportSidebar';
import { RegisteredReportRouteTracker } from '@/components/work/RegisteredReportRouteTracker';
import { RegisteredReportTabs } from '@/components/work/RegisteredReportTabs';
import { WorkHeader, WorkTabProvider } from '@/components/work/WorkHeader';
import { hasRegisteredReportSourceProposal } from '@/utils/registeredReportRoute';
import {
  getRegisteredReportMetadata,
  getRegisteredReportWorkOrNotFound,
} from '@/components/work/registeredReportRouteServer';

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
    const payload = await getRegisteredReportWorkOrNotFound(id);
    const work = payload.work;
    const previewText = stripHtml(work.previewContent || work.abstract || '').substring(0, 155);

    return buildArticleMetadata({
      title: work.title,
      description: previewText || 'View this registered report on ResearchHub.',
      url: `/report/${id}/${slug}`,
      image: work.image,
      publishedTime: work.publishedDate || work.createdDate,
      modifiedTime: work.updatedDate,
      authors: work.authors.map((a) => a.authorProfile.fullName),
      section: work.topics[0]?.name,
      tags: work.topics.map((t) => t.name),
    });
  } catch {
    return {};
  }
}

export default async function RegisteredReportLayout({ params, children }: Readonly<Props>) {
  const { id, slug } = await params;
  const payload = await getRegisteredReportWorkOrNotFound(id);
  const metadata = await getRegisteredReportMetadata(payload.work, payload.proposal);
  const hasSourceProposal = hasRegisteredReportSourceProposal(payload);
  const reviewsTabUrl = hasSourceProposal
    ? `/report/${payload.work.id}/${slug}/reviews`
    : undefined;

  return (
    <WorkTabProvider>
      <PageLayout
        topBanner={
          <WorkHeader
            work={payload.work}
            metadata={metadata}
            contentType="post"
            reviewsTabUrl={reviewsTabUrl}
            preTitle={
              <RegisteredReportRouteTracker
                tracker={payload.tracker}
                reportId={payload.work.id}
                currentStage="registered_report"
              />
            }
            tabs={
              <RegisteredReportTabs
                reportId={payload.work.id}
                slug={slug}
                hasSourceProposal={hasSourceProposal}
                reviewCount={payload.proposal?.peerReviews.length ?? 0}
              />
            }
          />
        }
        rightSidebar={
          <RegisteredReportSidebar proposal={payload.proposal} reportDoi={payload.work.doi} />
        }
      >
        {children}
      </PageLayout>
    </WorkTabProvider>
  );
}
