import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { DOISection } from './components/DOISection';
import { PeerReviewsSection } from './components/PeerReviewsSection';
import { TopicsSection } from './components/TopicsSection';
import type { RegisteredReportProposalDetails } from '@/types/registeredReport';

interface RegisteredReportSidebarProps {
  proposal: RegisteredReportProposalDetails | null;
  reportDoi?: string;
  reviewsUrl?: string;
}

export function RegisteredReportSidebar({
  proposal,
  reportDoi,
  reviewsUrl,
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
      {reviewsUrl && (
        <PeerReviewsSection peerReviews={proposal.peerReviews} reviewsUrl={reviewsUrl} />
      )}
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
