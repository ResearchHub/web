import { RegisteredReportDocument } from '@/components/work/RegisteredReportDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import {
  getRegisteredReportContent,
  getRegisteredReportMetadata,
  getRegisteredReportWorkOrNotFound,
} from '@/components/work/registeredReportRouteServer';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function RegisteredReportPage({ params }: Readonly<Props>) {
  const resolvedParams = await params;
  const payload = await getRegisteredReportWorkOrNotFound(resolvedParams.id);
  const [metadata, content] = await Promise.all([
    getRegisteredReportMetadata(payload.work, payload.proposal),
    getRegisteredReportContent(payload.work),
  ]);

  return (
    <>
      <RegisteredReportDocument work={payload.work} content={content} />
      <SearchHistoryTracker work={payload.work} />
      <WorkDocumentTracker work={payload.work} metadata={metadata} tab="paper" />
    </>
  );
}
