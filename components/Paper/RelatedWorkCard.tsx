import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { truncateText } from '@/utils/stringUtils';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { Topic } from '@/types/topic';
import { useClickContext } from '@/contexts/ClickContext';

interface RelatedWorkCardProps {
  work: Work;
  onClick?: () => void;
  onTopicClick?: (topic: Topic) => void;
  onEvent?: (event: { type: string; payload: any }) => void;
  size?: 'default' | 'sm' | 'lg' | 'xs';
}

export const RelatedWorkCard = ({
  work,
  onClick,
  onTopicClick,
  onEvent,
  size = 'default',
}: RelatedWorkCardProps) => {
  const { triggerEvent } = useClickContext();
  if (!work) return null;

  // Convert work authors to the format expected by AuthorList
  const authors =
    work.authors?.map((author) => ({
      name: author.authorProfile.fullName,
      verified: author.authorProfile.user?.isVerified,
      profileUrl: author.authorProfile.profileUrl,
    })) || [];

  // Handle click on the paper card
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (work.id && work.slug) {
      // Default behavior: open the document in a new tab
      let path;
      if (work.contentType === 'preregistration') {
        path = `/fund/${work.id}/${work.slug}`;
      } else if (work.contentType === 'post') {
        path = `/post/${work.id}/${work.slug}`;
      } else if (work.contentType === 'paper') {
        path = `/paper/${work.id}/${work.slug}`;
      } else {
        // For other content types like 'question', 'discussion', 'funding_request'
        path = `/post/${work.id}/${work.slug}`;
      }
      window.open(path, '_blank');
    }
  };

  // Determine badge type based on content type
  const getBadgeType = ():
    | 'paper'
    | 'funding'
    | 'bounty'
    | 'review'
    | 'article'
    | 'preprint'
    | 'published' => {
    // If it's a fundraise preregistration, show funding badge
    if (work.contentType === 'preregistration') {
      return 'funding';
    }

    // Map content types to badge types
    switch (work.contentType) {
      case 'post':
        return 'article';
      case 'paper':
        // For papers, check the work type
        if (work.type === 'preprint') {
          return 'preprint';
        } else if (work.type === 'article') {
          return 'paper';
        }
        return 'paper';
      case 'funding_request':
        return 'funding';
      default:
        return 'paper';
    }
  };

  // Determine text size classes based on the size prop
  const getTitleClass = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getAbstractClass = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  // Truncate abstract for display
  const maxLength = size === 'lg' ? 200 : size === 'default' ? 150 : 100;
  const displayAbstract = work.abstract ? truncateText(work.abstract, maxLength) : '';

  return (
    <div
      // TODO: Add left border with dark gray thick and do not round top left and bottom right corners
      className={`bg-gray-50 rounded-lg border border-l-2 border-l-gray-600 border-gray-200 rounded-tl-none rounded-bl-none p-4 ${onClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
      onClick={handleClick}
    >
      {/* Badge and Topics */}
      <div className="flex flex-wrap gap-2 mb-3">
        <ContentTypeBadge size={size} type={getBadgeType()} />
        {(work.topics || []).slice(0, 2).map((topic) => (
          <div
            key={topic.id || topic.slug}
            onClick={(e) => {
              e.stopPropagation();
              if (onTopicClick) {
                onTopicClick(topic);
              } else if (onEvent) {
                onEvent({ type: 'topic', payload: topic });
              } else {
                triggerEvent({ type: 'topic', payload: topic });
              }
            }}
          >
            <TopicAndJournalBadge
              type="topic"
              name={topic.name}
              slug={topic.slug}
              disableLink={true}
              imageUrl={topic.imageUrl}
            />
          </div>
        ))}
      </div>

      {/* Paper title */}
      <h3 className={`font-medium text-gray-900 ${getTitleClass()}`}>{work.title}</h3>

      {/* Authors using AuthorList component */}
      {authors.length > 0 && (
        <div className="mt-1">
          <AuthorList
            authors={authors}
            size={size === 'lg' ? 'sm' : 'xs'}
            className="text-gray-600 font-normal"
            delimiter="•"
          />
        </div>
      )}

      {/* Abstract */}
      {displayAbstract && (
        <div className={`mt-2 text-gray-600 ${getAbstractClass()}`}>{displayAbstract}</div>
      )}
    </div>
  );
};
