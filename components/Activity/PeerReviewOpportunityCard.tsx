'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/Editor/components/ui/Button/Button';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { Avatar } from '@/components/ui/Avatar';
import { DocumentPreviewCard } from './DocumentPreviewCard';
import { formatTimeAgo } from '@/utils/date';
import type { CommentContent } from '@/components/Comment/lib/types';
import type { ReviewOpportunity } from './lib/feedEntryAdapters';

const FOUNDATION_AVATAR =
  'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/05/28/blob_aBYdPow';

const BOUNTY_PREVIEW: CommentContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'ResearchHub Foundation is offering an incentive of $150 in ResearchCoin (RSC) for up to two high-quality, rigorous, and constructive peer reviews of this proposal.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Requirements:' }],
    },
    {
      type: 'orderedList',
      content: [
        'Verify identity and complete profile (including ORCID auth) on ResearchHub.',
        'Submit your review within 14 days of the date this bounty was initiated.',
        'Describe the relevance of your domain expertise to the manuscript.',
        'Disclose AI use. Please refer to our AI Policy for additional details.',
        'Disclose conflicts of interest.',
      ].map((text) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text }],
          },
        ],
      })),
    },
  ],
};

interface PeerReviewOpportunityCardProps {
  opportunity: ReviewOpportunity;
  /** Show a thumbnail in the document card, falling back to a placeholder. */
  showThumbnail?: boolean;
}

export const PeerReviewOpportunityCard: FC<PeerReviewOpportunityCardProps> = ({
  opportunity,
  showThumbnail = false,
}) => {
  const { title, href, previewImage, timestamp, documentInfo, metaLabel } = opportunity;
  const router = useRouter();
  const isProposal = documentInfo?.typeLabel === 'Proposal';

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <div className="pt-0.5">
          <Avatar src={FOUNDATION_AVATAR} alt="ResearchHub Foundation" size={32} disableTooltip />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-x-1.5 text-sm leading-tight">
            <span className="font-medium text-gray-900">ResearchHub Foundation</span>
            <span className="text-gray-500">opened a peer review bounty for</span>
            <span className="font-mono text-sm font-medium text-orange-600">$150</span>
          </div>
        </div>
      </div>

      <div className="ml-[42px] mt-2">
        <CommentReadOnly
          content={BOUNTY_PREVIEW}
          contentFormat="TIPTAP"
          maxLength={250}
          showReadMoreButton
          className="text-sm"
        />

        <div className="mt-2">
          <DocumentPreviewCard
            title={title}
            href={href}
            imageSrc={previewImage}
            showPlaceholder={showThumbnail}
            authors={isProposal ? [] : documentInfo?.authors}
            institution={documentInfo?.institution}
            score={documentInfo?.reviewScore}
            meta={metaLabel}
            action={
              href ? (
                <Button
                  variant="primary"
                  buttonSize="small"
                  onClick={() => router.push(href)}
                  className="rounded-md border border-white/40"
                >
                  Review
                  <ArrowRight size={14} aria-hidden />
                </Button>
              ) : undefined
            }
          />
        </div>

        {timestamp && (
          <span className="mt-2 block text-xs text-gray-400">{formatTimeAgo(timestamp)}</span>
        )}
      </div>
    </div>
  );
};
