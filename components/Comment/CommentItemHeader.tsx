import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { CommentType } from '@/types/comment';
import { Star } from 'lucide-react';

interface CommentItemHeaderProps {
  profileImage: string | null;
  fullName: string;
  profileUrl: string;
  action?: string;
  date: string | Date;
  className?: string;
  commentType?: CommentType;
  score?: number;
}

// Simple read-only stars component for displaying review score
const ReadOnlyStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export const CommentItemHeader = ({
  profileImage,
  fullName,
  profileUrl,
  action,
  date,
  className,
  commentType,
  score = 0,
}: CommentItemHeaderProps) => {
  const formattedDate = date instanceof Date ? date : new Date(date);
  // Determine the action text based on comment type if not explicitly provided
  const actionText =
    action ||
    (commentType === 'BOUNTY'
      ? 'opened bounty'
      : commentType === 'REVIEW'
        ? 'peer reviewed'
        : 'commented');

  const isReview = commentType === 'REVIEW';

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        <Avatar src={profileImage} alt={fullName} size="sm" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[15px]">
            <a href={profileUrl} className="font-semibold hover:text-indigo-600">
              {fullName}
            </a>
            <span className="text-gray-600">{actionText}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {formattedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Display review stars if this is a review comment and has a score */}
      {isReview && score > 0 && (
        <div className="flex items-center">
          <ReadOnlyStars rating={score} />
        </div>
      )}
    </div>
  );
};
