import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { truncateText } from '@/utils/stringUtils';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { Topic } from '@/types/topic';
import { useClickContext } from '@/contexts/ClickContext';
import { Fundraise } from '@/types/feed';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatRSC } from '@/utils/number';
import { usePathname } from 'next/navigation';

interface RelatedWorkCardProps {
  work: Work;
  onClick?: () => void;
  onTopicClick?: (topic: Topic) => void;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  fundraiseData?: Fundraise;
  onFeedItemClick?: () => void;
}

export const RelatedWorkCard = ({
  work,
  onClick,
  onTopicClick,
  size = 'default',
  fundraiseData,
  onFeedItemClick,
}: RelatedWorkCardProps) => {
  const { triggerEvent } = useClickContext();
  const { exchangeRate, isLoading: isLoadingExchangeRate } = useExchangeRate();
  const pathname = usePathname();

  if (!work) return null;

  // Convert work authors to the format expected by AuthorList
  const authors =
    work.authors?.map((author) => ({
      name: author.authorProfile.fullName,
      verified: author.authorProfile.user?.isVerified,
      profileUrl: author.authorProfile.profileUrl,
    })) || [];

  // Handle click on the paper card
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onFeedItemClick) {
      onFeedItemClick();
    }

    if (onClick) {
      onClick();
    } else if (work.id && work.slug) {
      // Default behavior: open the document in a new tab
      let path;
      if (work.contentType === 'preregistration') {
        path = `/fund/${work.id}/${work.slug}`;
      } else if (work.contentType === 'post') {
        // Check if it's a question based on postType
        if (work.postType === 'QUESTION') {
          path = `/question/${work.id}/${work.slug}`;
        } else {
          path = `/post/${work.id}/${work.slug}`;
        }
      } else if (work.contentType === 'paper') {
        path = `/paper/${work.id}/${work.slug}`;
      } else {
        // For other content types like 'discussion', 'funding_request'
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
    | 'published'
    | 'question' => {
    // If it's a fundraise proposal, show funding badge
    if (work.contentType === 'preregistration') {
      return 'funding';
    }

    // Check if it's a question based on postType
    if (work.postType === 'QUESTION') {
      return 'question';
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
      className={`bg-gray-50 rounded-lg border !border-l-2 !border-l-gray-600 border-gray-200 !rounded-tl-none !rounded-bl-none p-4 ${onClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
      onClick={handleClick}
    >
      {/* Badge and Topics */}
      <div className="flex flex-wrap gap-2 mb-3">
        <ContentTypeBadge size={size} type={getBadgeType()} />
        {(work.topics || []).slice(0, 2).map((topic) => {
          // Check if we have custom handlers or if we're on the earn page
          const hasCustomHandler = onTopicClick;
          const isEarnPage = pathname === '/earn';
          const shouldUseClickContext = isEarnPage && !hasCustomHandler;

          return (
            <div
              key={topic.id || topic.slug}
              onClick={(e) => {
                e.stopPropagation();
                if (onTopicClick) {
                  onTopicClick(topic);
                } else if (shouldUseClickContext) {
                  // On earn page without custom handlers, use ClickContext for filtering
                  triggerEvent({ type: 'topic', payload: topic });
                }
                // Otherwise, let the TopicAndJournalBadge handle navigation
              }}
            >
              <TopicAndJournalBadge
                name={topic.name}
                slug={topic.slug}
                disableLink={!!hasCustomHandler || shouldUseClickContext}
              />
            </div>
          );
        })}
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

      {/* Funding Goal */}
      {fundraiseData?.goalAmount?.usd && (
        <div className="mt-3 flex items-center text-sm">
          <span className="font-medium text-gray-700">Funding Goal:</span>
          <span className="ml-1 font-semibold text-orange-600">
            {fundraiseData.goalAmount.usd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {!isLoadingExchangeRate && exchangeRate && exchangeRate > 0 && (
              <span className="text-gray-500">
                {` / ${formatRSC({ amount: fundraiseData.goalAmount.usd / exchangeRate, shorten: true, round: true })} RSC`}
              </span>
            )}
            {isLoadingExchangeRate && (
              <span className="text-gray-500 italic ml-1">Loading RSC...</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
