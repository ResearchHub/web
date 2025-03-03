import { FC } from 'react';
import { MessageCircle, ArrowUp, Flag, Edit2, Trash2, Forward } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserVoteType } from '@/types/comment';

interface ActionButtonProps {
  icon: any;
  count?: number;
  label: string;
  tooltip?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost';
  showLabel?: boolean;
  className?: string;
  active?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  variant = 'ghost',
  showLabel = false,
  className,
  active = false,
}) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    className={`flex items-center space-x-1.5 ${className || 'text-gray-900 hover:text-gray-900'} ${
      active ? 'text-indigo-600 hover:text-indigo-700' : ''
    }`}
    tooltip={tooltip}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : ''}`} fill="none" strokeWidth={2} />
    {count !== undefined && (
      <span className={`text-sm font-medium ${active ? 'text-indigo-600' : ''}`}>{count}</span>
    )}
    {showLabel && <span className="text-sm">{label}</span>}
    {!showLabel && <span className="sr-only">{label}</span>}
  </Button>
);

interface CommentItemActionsProps {
  score: number;
  replyCount: number;
  commentId: number;
  documentId: number;
  userVote?: UserVoteType;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onVote: (voteType: UserVoteType) => void;
  className?: string;
}

export const CommentItemActions: FC<CommentItemActionsProps> = ({
  score,
  replyCount,
  commentId,
  documentId,
  userVote,
  onReply,
  onEdit,
  onDelete,
  onShare,
  onVote,
  className,
}) => {
  const handleVote = () => {
    // Toggle between upvote and neutral
    const newVoteType = userVote === 'UPVOTE' ? 'NEUTRAL' : 'UPVOTE';
    onVote(newVoteType);
  };

  return (
    <div className={`flex items-center justify-between mt-4 ${className || ''}`}>
      <div className="flex items-center space-x-4">
        <ActionButton
          icon={ArrowUp}
          count={score}
          tooltip={userVote === 'UPVOTE' ? 'Remove upvote' : 'Upvote'}
          label="Upvote"
          onClick={handleVote}
          active={userVote === 'UPVOTE'}
        />
        <ActionButton
          icon={MessageCircle}
          tooltip="Reply"
          label="Reply"
          onClick={onReply}
          showLabel
        />
        <ActionButton icon={Forward} tooltip="Share" label="Share" onClick={onShare} showLabel />
        <ActionButton icon={Edit2} tooltip="Edit" label="Edit" onClick={onEdit} showLabel />
      </div>

      <div className="flex items-center space-x-4">
        <ActionButton
          icon={Trash2}
          tooltip="Delete comment"
          label="Delete"
          onClick={onDelete}
          className="text-gray-400 hover:text-gray-500"
        />
        <ActionButton
          icon={Flag}
          tooltip="Flag comment"
          label="Flag"
          className="text-gray-400 hover:text-gray-500"
        />
      </div>
    </div>
  );
};
