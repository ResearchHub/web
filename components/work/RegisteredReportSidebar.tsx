import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { DOISection } from './components/DOISection';
import { TopicsSection } from './components/TopicsSection';
import type {
  RegisteredReportProposalReview,
  RegisteredReportProposalDetails,
} from '@/types/registeredReport';

interface RegisteredReportSidebarProps {
  proposal: RegisteredReportProposalDetails | null;
  reportDoi?: string;
}

export function RegisteredReportSidebar({
  proposal,
  reportDoi,
}: Readonly<RegisteredReportSidebarProps>) {
  if (!proposal) {
    return (
      <div className="space-y-12">
        <RestrictedProposalSection />
        {reportDoi && <DOISection doi={reportDoi} />}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <ProposalReviewsSection reviews={proposal.peerReviews} />
      <TopicsSection topics={proposal.topics} />
      {reportDoi && <DOISection doi={reportDoi} />}
    </div>
  );
}

function RestrictedProposalSection() {
  return (
    <section>
      <SidebarHeader title="Source Proposal" className="mb-3" />
      <p className="text-sm text-gray-500">
        The attached proposal is restricted or unavailable to you.
      </p>
    </section>
  );
}

function ProposalReviewsSection({
  reviews,
}: Readonly<{ reviews: RegisteredReportProposalReview[] }>) {
  return (
    <section>
      <SidebarHeader title="Peer Reviews" className="mb-3" />
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No peer reviews are available.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ProposalReview key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProposalReview({ review }: Readonly<{ review: RegisteredReportProposalReview }>) {
  const reviewerName = review.reviewer?.fullName || 'Anonymous reviewer';

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium text-gray-900">{reviewerName}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-700">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          {review.score.toFixed(1)}
        </span>
      </div>
      {review.createdDate && (
        <div className="mt-1 text-xs text-gray-500">{formatReviewDate(review.createdDate)}</div>
      )}
    </div>
  );
}

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Review date unavailable';

  return formatDistanceToNow(date, { addSuffix: true });
}
