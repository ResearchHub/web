'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { PageLayout } from '@/app/layouts/PageLayout';
import { RfpDetailCard } from '@/components/Portfolio/RfpDetailCard';
import { RfpRightSidebar } from '@/components/Portfolio/RfpRightSidebar';
import { RfpDashboardTabs } from '@/components/Portfolio/RfpDashboardTabs';
import { useGrantOverview } from '@/components/Portfolio/lib/hooks/useGrantOverview';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { Loader2 } from 'lucide-react';

export default function RfpDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const postId = String(params.id);
  const numericPostId = Number(postId);
  const { user, isLoading: isUserLoading } = useUser();

  const [work, setWork] = useState<Work | null>(null);
  const [isWorkLoading, setIsWorkLoading] = useState(true);

  const grantId = work?.note?.post?.grant?.id ? Number(work.note.post.grant.id) : null;
  const { overview, isLoading: isOverviewLoading } = useGrantOverview(numericPostId);

  // Auth guard
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(`/fund/dashboard/${postId}`)}`);
    }
  }, [user, isUserLoading, router, postId]);

  // Fetch post to extract grant details
  useEffect(() => {
    PostService.get(postId)
      .then(setWork)
      .catch(() => setWork(null))
      .finally(() => setIsWorkLoading(false));
  }, [postId]);

  if (isUserLoading || isWorkLoading) {
    return (
      <PageLayout rightSidebar={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;

  return (
    <PageLayout
      rightSidebar={<RfpRightSidebar overview={overview} isLoading={isOverviewLoading} />}
    >
      <div className="space-y-6">
        <div className="pl-1 tablet:!pl-0">
          <h2 className="text-2xl font-bold text-gray-900">RFP Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Review applicants, track funded research, and manage your grant.
          </p>
        </div>

        {work && <RfpDetailCard work={work} />}
        <RfpDashboardTabs grantId={grantId} overview={overview} />
      </div>
    </PageLayout>
  );
}
