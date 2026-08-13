import { RegisteredReportProposalUpdates } from '@/components/work/RegisteredReportProposalUpdates';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import {
  getRegisteredReportMetadata,
  getRegisteredReportSourceProposalPostIdOrNotFound,
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
  const sourceProposalId = getRegisteredReportSourceProposalPostIdOrNotFound(payload);
  const reportMetadata = await getRegisteredReportMetadata(payload.work);

  return (
    <>
      <RegisteredReportProposalUpdates sourceProposalId={sourceProposalId} />
      <SearchHistoryTracker work={payload.work} />
      <WorkDocumentTracker work={payload.work} metadata={reportMetadata} tab="updates" />
    </>
  );
}
