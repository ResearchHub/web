import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Work } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorList } from '@/components/ui/AuthorList';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { PaperIcon } from '@/components/ui/icons';

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
        timestamp={paper.createdDate || paper.publishedDate}
        authors={Array.isArray(authorData) ? authorData : [authorData]}
      />
    );
  },

  renderBody: (paper, options = {}) => {
    const { context = {} } = options;

    // Get authors from context if available
    const authors = context.authors || [];
    const onViewPaper = context.onViewPaper;

    // Create paper badge with a different icon and styling
    const paperBadge = (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <PaperIcon width={12} height={14} className="text-gray-600" />
        <span>Paper</span>
      </div>
    );

    // Create journal badge if available using the new component
    const journalBadge = paper.journal && (
      <TopicAndJournalBadge
        type="journal"
        name={paper.journal.name}
        slug={paper.journal.slug}
        imageUrl={paper.journal.imageUrl}
        className="ml-2"
      />
    );

    // Create topic badge if available using the new component
    const topicBadge = paper.topics && paper.topics.length > 0 && (
      <TopicAndJournalBadge
        type="topic"
        name={paper.topics[0].name}
        slug={paper.topics[0].slug}
        imageUrl={paper.topics[0].imageUrl}
        className="ml-2"
      />
    );

    // Function to truncate abstract to approximately 100 characters
    const truncateAbstract = (text: string) => {
      if (!text) return 'No abstract available';
      if (text.length <= 100) return text;

      // Find the last space before 100 characters to avoid cutting words
      const lastSpace = text.substring(0, 200).lastIndexOf(' ');
      return text.substring(0, lastSpace > 0 ? lastSpace : 200) + '...';
    };

    return (
      <div className="space-y-3">
        {/* Paper badge above title */}
        <div className="flex items-center flex-wrap gap-2">
          {paperBadge}
          {journalBadge}
          {topicBadge}
        </div>

        {/* Paper title */}
        <h3
          className="text-base font-medium text-gray-900 cursor-pointer hover:text-blue-600"
          onClick={onViewPaper}
        >
          {paper.title}
        </h3>

        {/* Authors using AuthorList component - with reduced margin */}
        {authors.length > 0 && (
          <div className="mt-0.5">
            <AuthorList
              authors={authors}
              size="xs"
              className="text-gray-600 font-normal"
              delimiter="•"
            />
          </div>
        )}

        {/* Abstract - shorter with no expand option */}
        <div className="mt-2 text-gray-600 text-sm line-clamp-2">
          {truncateAbstract(paper.abstract || '')}
        </div>
      </div>
    );
  },

  /**
   * Render content-specific actions that appear within the body
   */
  renderContentActions: (paper, options = {}) => {
    // We've removed the content actions as requested
    return null;
  },

  /**
   * Render footer actions that appear at the bottom of every card
   */
  renderFooterActions: (paper, options = {}) => {
    const { showActions = true, onUpvote, onComment, onShare } = options;

    if (!showActions) return null;

    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onUpvote ? () => onUpvote(paper.id) : undefined}>
          Upvote
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment ? () => onComment(paper.id) : undefined}
        >
          Comment
        </Button>

        <Button variant="ghost" size="sm" onClick={onShare ? () => onShare(paper.id) : undefined}>
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
      profileImage: author.authorProfile.profileImage || '',
      profileUrl: author.authorProfile.profileUrl || '#',
      isVerified: author.authorProfile.user?.isVerified,
    }));
  },

  getMetadata: (paper) => {
    return {
      timestamp: paper.createdDate || paper.publishedDate,
      type: 'paper',
      doi: paper.doi,
      journal: paper.journal?.name,
      hasAbstract: !!paper.abstract && paper.abstract.length > 0,
      hasAuthors: paper.authors && paper.authors.length > 0,
      authorCount: paper.authors?.length || 0,
      hasTopic: paper.topics && paper.topics.length > 0,
      topicName: paper.topics && paper.topics.length > 0 ? paper.topics[0].name : undefined,
    };
  },
};
