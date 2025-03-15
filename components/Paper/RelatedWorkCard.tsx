import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface RelatedWorkCardProps {
  work: Work;
  onClick?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'xs';
}

export const RelatedWorkCard = ({ work, onClick, size = 'default' }: RelatedWorkCardProps) => {
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
      // Default behavior: open the paper in a new tab
      window.open(`/paper/${work.id}/${work.slug}`, '_blank');
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

  return (
    <div
      className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${onClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
      onClick={handleClick}
    >
      {/* Paper badge above title - full width */}
      <div className="mb-3">
        <ContentTypeBadge size={size} type="paper" />
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
    </div>
  );
};
