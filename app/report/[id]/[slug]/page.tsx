import { MetadataService } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import { RegisteredReportDocument } from '@/components/work/RegisteredReportDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { createRegisteredReportFallbackMetadata } from '@/components/work/registeredReportWorkUtils';
import { getRegisteredReportWorkOrNotFound } from '@/components/work/registeredReportRouteServer';
import type { RegisteredReportWork } from '@/types/registeredReport';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

/**
 * Loads registered-report HTML content when it is not already inline.
 */
async function getRegisteredReportContent(work: RegisteredReportWork): Promise<string | undefined> {
  const inlineFormattedContent = work.formattedHtml || work.fullSrc || work.fullMarkdown;
  if (inlineFormattedContent) return inlineFormattedContent;
  if (!work.contentUrl) return undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch registered report content:', error);
    return undefined;
  }
}

/**
 * Loads registered-report metadata with the local fallback shape.
 */
async function getRegisteredReportMetadata(work: RegisteredReportWork) {
  if (!work.unifiedDocumentId) return createRegisteredReportFallbackMetadata(work);

  try {
    return await MetadataService.get(work.unifiedDocumentId.toString());
  } catch (error) {
    console.error('Failed to fetch registered report metadata:', error);
    return createRegisteredReportFallbackMetadata(work);
  }
}

export default async function RegisteredReportPage({ params }: Props) {
  const resolvedParams = await params;
  const payload = await getRegisteredReportWorkOrNotFound(resolvedParams.id);
  const [metadata, content] = await Promise.all([
    getRegisteredReportMetadata(payload.work),
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
