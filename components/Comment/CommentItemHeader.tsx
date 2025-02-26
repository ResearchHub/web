import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { CommentType } from '@/types/comment';

interface CommentItemHeaderProps {
  profileImage: string | null;
  fullName: string;
  profileUrl: string;
  action?: string;
  date: string | Date;
  className?: string;
  commentType?: CommentType;
}

export const CommentItemHeader = ({
  profileImage,
  fullName,
  profileUrl,
  action,
  date,
  className,
  commentType,
}: CommentItemHeaderProps) => {
  const formattedDate = date instanceof Date ? date : new Date(date);

  // Determine the action text based on comment type if not explicitly provided
  const actionText = action || (commentType === 'BOUNTY' ? 'opened bounty' : 'commented');

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar src={profileImage} alt={fullName} size="sm" />
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
  );
};
