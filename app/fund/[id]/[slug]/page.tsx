import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingRightSidebar } from '@/components/work/FundingRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import type { WorkMetadata } from '@/services/metadata.service';
import { FundItem } from '@/components/Fund/FundItem';
import { WorkLineItems } from '@/components/work/WorkLineItems';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/BlockEditorClientWrapper';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getFundingProject(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    const work = await PostService.get(id);
    return work;
  } catch (error) {
    notFound();
  }
}

async function getWorkHTMLContent(work: Work): Promise<string | undefined> {
  if (!work.contentUrl) return undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getFundingProject(resolvedParams.id);
  return {
    title: project.title,
    description: project.abstract || '',
  };
}

interface FundingDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  content?: string;
}

function FundingDocument({ work, metadata, content }: FundingDocumentProps) {
  console.log('metadata', metadata);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{work.title}</h1>
        <WorkLineItems work={work} showClaimButton={false} />
      </div>

      {metadata.fundraising && (
        <FundItem
          id={metadata.fundraising.id}
          title={work.title}
          status={metadata.fundraising.status}
          amount={metadata.fundraising.amountRaised.rsc}
          goalAmount={metadata.fundraising.goalAmount.rsc}
          deadline={metadata.fundraising.endDate}
          contributors={metadata.fundraising.contributors.topContributors.map((profile) => ({
            profile,
            amount: 0, // Individual contribution amounts not available in metadata
          }))}
          nftRewardsEnabled={work.figures.length > 0}
          nftImageSrc={work.figures[0]?.url}
        />
      )}

      {/* Debug section */}
      <details className="mb-8">
        <summary className="cursor-pointer text-gray-600">Debug Info</summary>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Work Data:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(work, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Metadata:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      </details>

      {/* Content section */}
      {work.note?.contentJson ? (
        <div className="h-full">
          <BlockEditorClientWrapper contentJson={work.note?.contentJson} editable={false} />
        </div>
      ) : content ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : work.previewContent ? (
        <div className="prose max-w-none whitespace-pre-wrap">{work.previewContent}</div>
      ) : (
        <p className="text-gray-500">No content available</p>
      )}
    </div>
  );
}

export default async function FundingProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // First fetch the work to get the unifiedDocumentId
  const work = await getFundingProject(id);

  // Then fetch metadata using unifiedDocumentId
  const metadata = await MetadataService.get(work.unifiedDocumentId.toString());

  // Only fetch content after we have the work object with contentUrl
  const content = await getWorkHTMLContent(work);

  return (
    <PageLayout rightSidebar={<FundingRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <FundingDocument work={work} metadata={metadata} content={content} />
        <SearchHistoryTracker work={work} />
      </Suspense>
    </PageLayout>
  );
}
