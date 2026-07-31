import { RegisteredReportProposalUpdates } from '@/components/work/RegisteredReportProposalUpdates';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import {
  getRegisteredReportMetadata,
  getRegisteredReportSourceProposalOrNotFound,
  getRegisteredReportWorkOrNotFound,
} from '@/components/work/registeredReportRouteServer';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function RegisteredReportUpdatesPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const payload = await getRegisteredReportWorkOrNotFound(id);
  const [proposal, reportMetadata] = await Promise.all([
    getRegisteredReportSourceProposalOrNotFound(payload),
    getRegisteredReportMetadata(payload.work),
  ]);

  return (
    <>
      <RegisteredReportProposalUpdates proposal={proposal} />
      <SearchHistoryTracker work={payload.work} />
      <WorkDocumentTracker work={payload.work} metadata={reportMetadata} tab="updates" />
    </>
  );
}
