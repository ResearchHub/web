'use client';

import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/contexts/UserContext';
import { PenLine, Star } from 'lucide-react';
import { CommentType } from '@/types/comment';

interface CollapsedCommentEditorProps {
  commentType?: CommentType;
  /** Opens the editor; for a signed-out visitor, the sign-in prompt. */
  onExpand: () => void;
}

const PROMPTS: Partial<Record<CommentType, string>> = {
  REVIEW: 'write a peer review',
  AUTHOR_UPDATE: 'post an update',
};

export const CollapsedCommentEditor = ({ commentType, onExpand }: CollapsedCommentEditorProps) => {
  const { user } = useUser();
  const authorProfile = user?.authorProfile;
  const isReview = commentType === 'REVIEW';
  const prompt = (commentType && PROMPTS[commentType]) || 'add a comment';
  const placeholder = user ? prompt : `Sign in to ${prompt}`;

  return (
    <div className="flex items-center gap-2">
      <Avatar
        src={authorProfile?.profileImage}
        alt={authorProfile?.fullName || 'You'}
        authorId={authorProfile?.id}
        size="md"
        disableTooltip
      />
      <button
        type="button"
        onClick={onExpand}
        className="group flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-gray-400 px-4 text-left transition-colors hover:border-gray-600 hover:bg-gray-50"
        data-testid="comment-editor-collapsed"
      >
        <span className="flex-1 truncate text-sm text-gray-500 first-letter:uppercase group-hover:text-gray-700">
          {placeholder}
        </span>
        {isReview && (
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
            ))}
          </span>
        )}
        <PenLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </button>
    </div>
  );
};
