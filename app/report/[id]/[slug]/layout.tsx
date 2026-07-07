import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { buildArticleMetadata } from '@/lib/metadata';
import { stripHtml } from '@/utils/stringUtils';
import { RegisteredReportWorkShell } from '@/components/work/RegisteredReportWorkShell';
import { createRegisteredReportFallbackMetadata } from '@/components/work/registeredReportWorkUtils';
import { RegisteredReportWork } from '@/types/registeredReport';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
  children: React.ReactNode;
}

async function getRegisteredReportWork(id: string) {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PostService.getRegisteredReportWork(id);
  } catch {
    notFound();
  }
}

async function getRegisteredReportContent(contentUrl?: string): Promise<string | undefined> {
  if (!contentUrl) return undefined;

  try {
    return await PostService.getContent(contentUrl);
  } catch (error) {
    console.error('Failed to fetch registered report content:', error);
    return undefined;
  }
}

async function getRegisteredReportMetadata(work: RegisteredReportWork) {
  if (!work.unifiedDocumentId) return createRegisteredReportFallbackMetadata(work);

  try {
    return await MetadataService.get(work.unifiedDocumentId.toString());
  } catch (error) {
    console.error('Failed to fetch registered report metadata:', error);
    return createRegisteredReportFallbackMetadata(work);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;

  try {
    const payload = await getRegisteredReportWork(id);
    const work = payload.work;
    const previewText = stripHtml(work.previewContent || work.abstract || '').substring(0, 155);

    return buildArticleMetadata({
      title: work.title,
      description: previewText || 'View this registered report on ResearchHub.',
      url: `/report/${id}/${slug}`,
      image: work.image,
      publishedTime: work.publishedDate || work.createdDate,
      modifiedTime: work.updatedDate,
      authors: work.authors.map((a) => a.authorProfile.fullName),
      section: work.topics[0]?.name,
      tags: work.topics.map((t) => t.name),
    });
  } catch {
    return {};
  }
}

export default async function RegisteredReportLayout({ params, children }: Props) {
  const { id } = await params;
  const payload = await getRegisteredReportWork(id);
  const inlineFormattedContent =
    payload.work.formattedHtml || payload.work.fullSrc || payload.work.fullMarkdown || undefined;
  const [metadata, content] = await Promise.all([
    getRegisteredReportMetadata(payload.work),
    inlineFormattedContent
      ? Promise.resolve(inlineFormattedContent)
      : getRegisteredReportContent(payload.work.contentUrl),
  ]);

  return (
    <RegisteredReportWorkShell
      initialPayload={payload}
      initialMetadata={metadata}
      initialReportContent={content}
    >
      {children}
    </RegisteredReportWorkShell>
  );
}
