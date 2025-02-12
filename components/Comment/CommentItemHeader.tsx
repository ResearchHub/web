import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';

interface CommentItemHeaderProps {
  profileImage: string | null;
  fullName: string;
  profileUrl: string;
  action?: string;
  date: string | Date;
  className?: string;
}

export const CommentItemHeader = ({
  profileImage,
  fullName,
  profileUrl,
  action = 'commented',
  date,
  className,
}: CommentItemHeaderProps) => {
  const formattedDate = date instanceof Date ? date : new Date(date);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar src={profileImage} alt={fullName} size="sm" />
      <div className="flex items-center gap-1.5 text-[15px]">
        <a href={profileUrl} className="font-semibold hover:text-indigo-600">
          {fullName}
        </a>
        <span className="text-gray-600">{action}</span>
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
