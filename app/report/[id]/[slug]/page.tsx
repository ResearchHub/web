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
  const { id } = await params;
  const payload = await getRegisteredReportWorkOrNotFound(id);
  const metadata = await getRegisteredReportMetadata(payload.work);
  const content = await getRegisteredReportContent(payload.work);

  return (
    <>
      <RegisteredReportDocument work={payload.work} content={content} />
      <SearchHistoryTracker work={payload.work} />
      <WorkDocumentTracker work={payload.work} metadata={metadata} tab="paper" />
    </>
  );
}
