'use client';

import { useMemo, use, Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingTabs } from '@/components/Funding/FundingTabs';
import { GrantPreview, GrantPreviewData } from '@/components/Funding/GrantPreview';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ProposalListProvider } from '@/contexts/ProposalListContext';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { WorkPrimaryActions } from '@/components/work/WorkPrimaryActions';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { FileText, LayoutList, MessageCircle, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';

function DetailsContent({
  work,
  htmlContentPromise,
}: {
  work: Work;
  htmlContentPromise: Promise<string | undefined>;
}) {
  const htmlContent = use(htmlContentPromise);

  if (work.previewContent) {
    return <PostBlockEditor content={work.previewContent} />;
  }

  if (htmlContent) {
    return (
      <div
        className="prose max-w-none bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return <p className="text-gray-500">No content available</p>;
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

type GrantTab = 'proposals' | 'details';

interface FundingGrantPageClientProps {
  work: Work;
  htmlContentPromise?: Promise<string | undefined>;
  initialTab?: GrantTab;
}

export function FundingGrantPageClient({
  work,
  htmlContentPromise,
  initialTab = 'proposals',
}: FundingGrantPageClientProps) {
  const grant = work.note?.post?.grant;

  const grantPreviewData = useMemo((): GrantPreviewData | null => {
    if (!grant) return null;

    return {
      id: work.id,
      slug: work.slug,
      title: work.title,
      previewImage: work.image,
      textPreview: work.abstract,
      description: grant.description,
      status: grant.status,
      isActive: grant.status === 'OPEN',
      amount: grant.amount,
      endDate: grant.endDate,
      startDate: grant.startDate,
      organization: grant.organization,
      applicantCount: grant.applicants?.length || 0,
    };
  }, [work, grant]);

  const metadata = useMemo(
    (): WorkMetadata => ({
      id: work.id,
      score: work.metrics?.adjustedScore ?? 0,
      topics: work.topics ?? [],
      metrics: work.metrics ?? { votes: 0, adjustedScore: 0, comments: 0, saves: 0 },
      bounties: [],
      openBounties: 0,
      closedBounties: 0,
    }),
    [work]
  );

  if (!grantPreviewData || !grant) {
    return null;
  }

  const grantTabs = [
    { id: 'proposals', label: 'Proposals', icon: FileText, href: `/funding/${work.id}` },
    { id: 'details', label: 'Details', icon: LayoutList, href: `/funding/${work.id}/details` },
    { id: 'conversation', label: 'Conversation', icon: MessageCircle },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      <FundingTabs selectedGrantId={work.id} className="mb-6" />

      <GrantPreview grant={grantPreviewData} className="mb-4" />

      <WorkPrimaryActions work={work} metadata={metadata} className="mb-4" />

      <div className="flex items-center border-b mb-4">
        <Tabs tabs={grantTabs} activeTab={initialTab} onTabChange={() => {}} />
        {grantPreviewData.isActive && (
          <Link
            href={`/grant/${work.id}/${work.slug}/applications`}
            className="ml-auto flex-shrink-0"
          >
            <Button variant="default" size="sm" className="gap-1.5 text-sm px-4 py-2.5 h-auto">
              Submit Proposal
              <ArrowRight size={13} />
            </Button>
          </Link>
        )}
      </div>

      {initialTab === 'proposals' && (
        <ProposalListProvider grantId={Number(grant.id)}>
          <FundingProposalGrid />
        </ProposalListProvider>
      )}

      {initialTab === 'details' && (
        <div>
          {htmlContentPromise ? (
            <Suspense fallback={<DetailsSkeleton />}>
              <DetailsContent work={work} htmlContentPromise={htmlContentPromise} />
            </Suspense>
          ) : work.previewContent ? (
            <PostBlockEditor content={work.previewContent} />
          ) : (
            <p className="text-gray-500">No content available</p>
          )}
        </div>
      )}
    </PageLayout>
  );
}
