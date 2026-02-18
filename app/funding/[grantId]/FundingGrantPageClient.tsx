'use client';

import { useMemo } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingTabs } from '@/components/Funding/FundingTabs';
import { GrantPreview, GrantPreviewData } from '@/components/Funding/GrantPreview';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { Tabs } from '@/components/ui/Tabs';
import { FileText, LayoutList, MessageCircle, Activity } from 'lucide-react';
import { Work } from '@/types/work';

type GrantTab = 'proposals' | 'details';

interface FundingGrantPageClientProps {
  work: Work;
  htmlContent?: string;
  initialTab?: GrantTab;
}

export function FundingGrantPageClient({
  work,
  htmlContent,
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
      <div className="border-b border-gray-200 mb-6">
        <FundingTabs selectedGrantId={work.id} />
      </div>

      <GrantPreview grant={grantPreviewData} className="mb-4" />

      <div className="border-b mb-4">
        <Tabs tabs={grantTabs} activeTab={initialTab} onTabChange={() => {}} />
      </div>

      {initialTab === 'proposals' && <FundingProposalGrid />}

      {initialTab === 'details' && (
        <div>
          {work.previewContent ? (
            <PostBlockEditor content={work.previewContent} />
          ) : htmlContent ? (
            <div
              className="prose max-w-none bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="text-gray-500">No content available</p>
          )}
        </div>
      )}
    </PageLayout>
  );
}
