import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Work } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import { Avatar } from '@/components/ui/Avatar';
import { ExpandableContent } from '../shared';

/**
 * Renderer for paper content
 */
export const PaperRenderer: ContentRenderer<Work> = {
  renderHeader: (paper, options = {}) => {
    const authorData = PaperRenderer.getAuthorData(paper);
    const metadata = PaperRenderer.getMetadata(paper);

    return (
      <FeedItemHeader
        contentType="paper"
        timestamp={paper.createdDate}
        authors={Array.isArray(authorData) ? authorData : [authorData]}
        action="published"
      />
    );
  },

  renderBody: (paper, options = {}) => {
    const { isExpanded = false, onToggleExpand = () => {} } = options;

    // Create badges for the expandable content
    const badges = (
      <>
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Paper
        </div>

        {paper.journal && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50">
            {paper.journal.imageUrl && (
              <Avatar
                src={paper.journal.imageUrl}
                alt={paper.journal.name}
                size="xxs"
                className="ring-1 ring-gray-200"
              />
            )}
            <span className="text-gray-700">{paper.journal.name}</span>
          </div>
        )}

        {paper.doi && (
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            DOI
          </div>
        )}
      </>
    );

    return (
      <div className="space-y-4">
        <ExpandableContent
          title={paper.title}
          content={paper.abstract || 'No abstract available'}
          badges={badges}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          maxLength={200}
        />
      </div>
    );
  },

  /**
   * Render content-specific actions that appear within the body
   */
  renderContentActions: (paper, options = {}) => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="secondary" size="sm">
          Read Paper
        </Button>

        <Button variant="outlined" size="sm">
          Add to Library
        </Button>
      </div>
    );
  },

  /**
   * Render footer actions that appear at the bottom of every card
   */
  renderFooterActions: (paper, options = {}) => {
    const { showActions = true } = options;

    if (!showActions) return null;

    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          Upvote
        </Button>

        <Button variant="ghost" size="sm">
          Comment
        </Button>

        <Button variant="ghost" size="sm">
          Share
        </Button>
      </div>
    );
  },

  getUrl: (paper) => {
    return `/paper/${paper.id}/${paper.slug || 'details'}`;
  },

  getAuthorData: (paper): AuthorData[] => {
    if (!paper.authors || paper.authors.length === 0) {
      return [DefaultRenderer.getAuthorData(paper) as AuthorData];
    }

    return paper.authors.map((author) => ({
      id: author.authorProfile.id,
      fullName: author.authorProfile.fullName || 'Unknown',
      profileImage: author.authorProfile.profileImage,
      profileUrl: author.authorProfile.profileUrl || '#',
      isVerified: author.authorProfile.user?.isVerified,
    }));
  },

  getMetadata: (paper) => {
    return {
      action: 'published',
      timestamp: paper.createdDate,
      type: 'paper',
      doi: paper.doi,
      journal: paper.journal?.name,
    };
  },
};
