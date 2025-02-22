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
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';

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

function removeTitle(contentJson: string): string {
  try {
    const content = JSON.parse(contentJson);
    const titleIndex = content.content.findIndex(
      (node: any) => node.type === 'heading' && node.attrs?.level === 1
    );

    if (titleIndex !== -1) {
      content.content.splice(titleIndex, 1);
    }

    return JSON.stringify(content);
  } catch (error) {
    console.error('Error processing content JSON:', error);
    return contentJson;
  }
}

function removeHtmlTitle(html: string): string {
  // Remove H1 tags and their content
  return html.replace(/<h1[^>]*>.*?<\/h1>/i, '');
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

      {/* Content section */}
      {
        // this is currently commented out because we do not want to show unpublished notes
        // work.note?.contentJson ? (
        //   <div className="h-full">
        //     <BlockEditorClientWrapper
        //       contentJson={removeTitle(work.note.contentJson)}
        //       editable={false}
        //       hideTitle={true}
        //     />
        //   </div>
        // ) :
        work.previewContent ? (
          <div className="h-full">
            <BlockEditorClientWrapper
              contentHtml={removeHtmlTitle(work.previewContent)}
              editable={false}
              hideTitle={true}
            />
          </div>
        ) : content ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-500">No content available</p>
        )
      }
    </div>
  );
}

export default async function FundingProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // First fetch the work to get the unifiedDocumentId
  const work = await getFundingProject(id);
  console.log('work', work);

  // Then fetch metadata using unifiedDocumentId
  const metadata = await MetadataService.get(work.unifiedDocumentId.toString());

  // Only fetch content after we have the work object with contentUrl
  const content = await getWorkHTMLContent(work);

  return (
    <PageLayout rightSidebar={<FundingRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <FundingDocument work={work} metadata={metadata} content={undefined} />
        <SearchHistoryTracker work={work} />
      </Suspense>
    </PageLayout>
  );
}
