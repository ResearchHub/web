'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Avatar } from '@/components/ui/Avatar';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { cn } from '@/utils/styles';

interface PeerReviewReviewer {
  id?: number;
  fullName?: string;
  profileImage?: string;
}

interface PeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: PeerReviewReviewer;
  score?: number;
  content: any;
  contentFormat?: any;
  workTitle?: string;
}

export const PeerReviewModal: FC<PeerReviewModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  score,
  content,
  contentFormat,
  workTitle,
}) => (
  <BaseModal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    title={
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-wider">
        <Star size={12} className="fill-amber-400 text-amber-400" />
        Peer Review
      </div>
    }
  >
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar
          src={reviewer.profileImage}
          alt={reviewer.fullName || 'Reviewer'}
          size={40}
          authorId={reviewer.id}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {reviewer.fullName || 'Anonymous reviewer'}
          </div>
          {workTitle && <div className="text-xs text-gray-500 truncate">on {workTitle}</div>}
        </div>
        {score != null && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                className={cn(
                  i <= Math.round(score)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
            <span className="ml-1 text-sm font-semibold text-amber-700">{score.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <CommentReadOnly
          content={content}
          contentFormat={contentFormat}
          initiallyExpanded
          showReadMoreButton={false}
          className="text-sm leading-relaxed text-gray-800"
        />
      </div>
    </div>
  </BaseModal>
);
