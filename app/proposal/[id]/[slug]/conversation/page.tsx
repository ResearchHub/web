import { Metadata } from 'next';
import { CommentService } from '@/services/comment.service';
import { FundDocument } from '@/components/work/FundDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import {
  buildProposalMetadata,
  getProposalContent,
  getProposalMetadata,
  getProposalOrNotFound,
} from '@/components/work/proposalRouteServer';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  return buildProposalMetadata({ id, slug, tab: 'conversation', titleSuffix: 'Conversation' });
}

export default async function FundConversationPage({ params }: Props) {
  const { id } = await params;

  const work = await getProposalOrNotFound(id);
  const [metadata, content, authorPosts] = await Promise.all([
    getProposalMetadata(work.unifiedDocumentId?.toString() || ''),
    getProposalContent(work),
    CommentService.fetchAuthorPosts({
      documentId: work.id,
      contentType: work.contentType,
    }),
  ]);

  return (
    <>
      <FundDocument work={work} metadata={metadata} content={content} authorPosts={authorPosts} />
      <SearchHistoryTracker work={work} />
      <WorkDocumentTracker work={work} metadata={metadata} tab="conversation" />
    </>
  );
}
