'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingTabs } from '@/components/Funding/FundingTabs';
import { GrantPreview, GrantPreviewData } from '@/components/Funding/GrantPreview';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { Work } from '@/types/work';

interface FundingGrantPageClientProps {
  work: Work;
  htmlContent?: string;
}

export function FundingGrantPageClient({ work, htmlContent }: FundingGrantPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showDetails = searchParams.get('details') === 'true';
  const [isInitialLoad, setIsInitialLoad] = useState(showDetails);
  const grant = work.note?.post?.grant;

  // Brief loading skeleton when navigating directly to ?details=true
  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => setIsInitialLoad(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  const grantPreviewData = useMemo((): GrantPreviewData | null => {
    if (!grant) return null;

    return {
      id: work.id,
      slug: work.slug,
      title: work.title,
      previewImage: work.image,
      textPreview: work.abstract,
      status: grant.status,
      isActive: grant.status === 'OPEN',
      amount: grant.amount,
      endDate: grant.endDate,
      organization: grant.organization,
      applicantCount: grant.applicants?.length || 0,
    };
  }, [work, grant]);

  if (!grantPreviewData || !grant) {
    return null;
  }

  const toggleDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showDetails) {
      params.delete('details');
    } else {
      params.set('details', 'true');
    }
    const query = params.toString();
    const url = `/funding/${work.id}${query ? `?${query}` : ''}`;
    router.replace(url, { scroll: false });
  };

  const hasContent = !!(work.previewContent || htmlContent);

  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      {/* Tabs - selectedGrantId is now the post ID */}
      <div className="border-b border-gray-200 mb-6">
        <FundingTabs selectedGrantId={work.id} />
      </div>

      {/* Grant Preview */}
      <GrantPreview
        grant={grantPreviewData}
        className="mb-4"
        showDetails={showDetails}
        onToggleDetails={hasContent ? toggleDetails : undefined}
      />

      {/* Expanded details section */}
      {showDetails && (
        <div className="mb-6">
          {isInitialLoad ? (
            <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Proposals */}
      <FundingProposalGrid grantId={grant.id as number} />
    </PageLayout>
  );
}
