import { FC } from 'react';
import { MessageCircle, ArrowUp, Flag, Edit2, Trash2, Forward } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ActionButtonProps {
  icon: any;
  count?: number;
  label: string;
  tooltip?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost';
  showLabel?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  variant = 'ghost',
  showLabel = false,
}) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    className="flex items-center space-x-1.5 text-gray-900 hover:text-gray-900"
    tooltip={tooltip}
  >
    <Icon className="w-5 h-5" />
    {count !== undefined && <span className="text-sm font-medium">{count}</span>}
    {showLabel && <span className="text-sm">{label}</span>}
    {!showLabel && <span className="sr-only">{label}</span>}
  </Button>
);

interface CommentItemActionsProps {
  score: number;
  replyCount: number;
  commentId: number;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
}

export const CommentItemActions: FC<CommentItemActionsProps> = ({
  score,
  replyCount,
  commentId,
  onReply,
  onEdit,
  onDelete,
  onShare,
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center space-x-4">
        <ActionButton icon={ArrowUp} count={score} tooltip="Upvote" label="Upvote" />
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
        <ActionButton icon={Trash2} tooltip="Delete comment" label="Delete" onClick={onDelete} />
        <ActionButton icon={Flag} tooltip="Flag comment" label="Flag" />
      </div>
    </div>
  );
};
