'use client';

import { FC, useState } from 'react';
import { Content, FeedContentType, FeedEntry } from '@/types/feed';
import { MessageCircle, Repeat, MoreHorizontal, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FeedItemMenu } from '@/components/menus/FeedItemMenu';
import { useVote } from '@/hooks/useVote';
import { ContentType } from '@/types/work';
import { UserVoteType } from '@/types/reaction';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ActionButtonProps {
  icon: any;
  count?: number;
  label: string;
  tooltip?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  isActive = false,
  isDisabled = false,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={`flex items-center space-x-1.5 ${isActive ? 'text-primary' : 'text-gray-900'} hover:text-gray-900`}
    tooltip={tooltip}
    onClick={onClick}
    disabled={isDisabled}
  >
    <Icon className="w-5 h-5" />
    {count !== undefined && count > 0 && <span className="text-sm font-medium">{count}</span>}
    <span className="sr-only">{label}</span>
  </Button>
);

interface FeedItemActionsProps {
  metrics?: FeedEntry['metrics'];
  content: Content;
  target?: Content;
  feedContentType: FeedContentType;
  votableEntityId?: number;
}

export const FeedItemActions: FC<FeedItemActionsProps> = ({
  metrics,
  content,
  target,
  feedContentType,
  votableEntityId,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [localVoteCount, setLocalVoteCount] = useState(metrics?.votes || 0);
  const [userVote, setUserVote] = useState<UserVoteType | undefined>(
    (content as any).userVote || undefined
  );

  // Use the provided votableEntityId or fall back to content.id
  const effectiveEntityId = votableEntityId || content.id;

  const { vote, isVoting } = useVote({
    votableEntityId: effectiveEntityId,
    feedContentType,
    onVoteSuccess: (response, voteType) => {
      // Update local state based on vote type
      if (voteType === 'UPVOTE' && userVote !== 'UPVOTE') {
        setLocalVoteCount((prev) => prev + 1);
      } else if (voteType === 'NEUTRAL' && userVote === 'UPVOTE') {
        setLocalVoteCount((prev) => Math.max(0, prev - 1));
      }
      setUserVote(voteType);
    },
  });

  const handleVote = () => {
    if (!session?.user) {
      // Redirect to login or show login modal
      router.push('/login');
      return;
    }

    // Toggle vote: if already upvoted, neutralize, otherwise upvote
    const newVoteType: UserVoteType = userVote === 'UPVOTE' ? 'NEUTRAL' : 'UPVOTE';

    // Create a minimal item object with the necessary properties
    const voteItem = {
      id: effectiveEntityId,
      userVote,
    };

    vote(voteItem, newVoteType);
  };

  return (
    <div className="flex items-center space-x-4">
      <ActionButton
        icon={ArrowUp}
        count={localVoteCount}
        tooltip="Upvote"
        label="Upvote"
        onClick={handleVote}
        isActive={userVote === 'UPVOTE'}
        isDisabled={isVoting}
      />
      <ActionButton
        icon={MessageCircle}
        count={metrics?.comments}
        tooltip="Comment"
        label="Comment"
      />
      <FeedItemMenu>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <MoreHorizontal className="w-5 h-5" />
          <span className="sr-only">More options</span>
        </Button>
      </FeedItemMenu>
    </div>
  );
};
