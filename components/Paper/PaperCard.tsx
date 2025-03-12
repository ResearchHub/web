import { useState } from 'react';
import { ContentType, Work } from '@/types/work';
import { ID } from '@/types/root';
import { ContentFormat } from '@/types/comment';
import { useSession } from 'next-auth/react';
import { contentRenderers } from '@/components/Feed/registry';
import { AuthorList, Author } from '@/components/ui/AuthorList';
import { Avatar } from '@/components/ui/Avatar';

export interface PaperViewEvent {
  paperId: ID;
  title: string;
}

export interface PaperCardProps {
  // Paper data
  paper: Work;

  // Content data
  content?: any;
  contentFormat?: ContentFormat;

  // Document data
  documentId?: number;
  contentType?: ContentType;

  // Callbacks
  isCreator?: boolean;
  onPaperUpdated?: () => void;
  onViewPaper?: (event: PaperViewEvent) => void;
  onUpvote?: (paperId: number) => void;
  onComment?: (paperId: number) => void;
  onShare?: (paperId: number) => void;
  onAddToLibrary?: (paperId: number) => void;

  // Navigation
  slug?: string;

  // Rendering options
  showFooter?: boolean;
  showActions?: boolean;
}

export const PaperCard = ({
  // Paper data
  paper,

  // Content data
  content,
  contentFormat,

  // Document data
  documentId,
  contentType,

  // Callbacks
  isCreator = false,
  onPaperUpdated,
  onViewPaper,
  onUpvote,
  onComment,
  onShare,
  onAddToLibrary,

  // Navigation
  slug,

  // Rendering options
  showFooter = true,
  showActions = true,
}: PaperCardProps) => {
  const { data: session } = useSession();

  // Check if the current user is the author of the paper
  const isAuthor = session?.user?.id === paper?.authors?.[0]?.authorProfile?.user?.id;

  // If no valid paper is provided, don't render anything
  if (!paper) {
    return null;
  }

  // Get the appropriate renderer from the registry
  const renderer = contentRenderers.paper || contentRenderers.default;

  // Convert work authors to the format expected by AuthorList
  const authors: Author[] =
    paper.authors?.map((author) => ({
      name: author.authorProfile.fullName || 'Unknown',
      verified: author.authorProfile.user?.isVerified,
      profileUrl: author.authorProfile.profileUrl || '#',
    })) || [];

  const handleViewPaper = () => {
    if (onViewPaper) {
      onViewPaper({ paperId: paper.id, title: paper.title });
    } else {
      // Default behavior: navigate to the paper page
      window.open(`/paper/${paper.id}/${paper.slug || 'details'}`, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header - always shown */}
      <div className="mb-2">{renderer.renderHeader(paper, {})}</div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Body - always show */}
        <div className="p-4">
          {/* Main content with renderer */}
          {renderer.renderBody(paper, {
            context: {
              commentContent: content,
              commentContentFormat: contentFormat,
              authors,
              onViewPaper: handleViewPaper,
            },
          })}
        </div>
      </div>

      {/* Footer actions - outside the card */}
      {showFooter &&
        renderer.renderFooterActions(paper, {
          showActions,
          onUpvote: onUpvote ? () => onUpvote(paper.id) : undefined,
          onComment: onComment ? () => onComment(paper.id) : undefined,
          onShare: onShare ? () => onShare(paper.id) : undefined,
          isAuthor,
        })}
    </div>
  );
};
