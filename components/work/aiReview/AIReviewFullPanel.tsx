'use client';

import { useMemo, useState } from 'react';
import { Bot, ClipboardCheck } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { useAIReviewMock } from './AIReviewMockContext';
import { categoryIssueCount, totalIssueCount, issueLabel } from './scoring';
import { reviewersFromIds } from './collectReviewers';
import type { CategoryDefinition, FundingQuality } from './types';

const fundingQualityConfig: Record<
  FundingQuality,
  { label: string; text: string; bg: string; border: string }
> = {
  LOW: { label: 'Low', text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200' },
  MEDIUM: {
    label: 'Medium',
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  HIGH: {
    label: 'High',
    text: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

export function AIReviewFullPanel({ className }: { className?: string }) {
  const { data } = useAIReviewMock();
  const { user } = useUser();
  const [showEditor, setShowEditor] = useState(false);

  const totalIssues = totalIssueCount(data.categories);
  const { consensusReview } = data;
  const fqConfig = fundingQualityConfig[consensusReview.fundingQuality];

  const reviewerAvatars = useMemo(() => {
    const reviewers = reviewersFromIds(consensusReview.reviewerIds, data.reviewers);
    return reviewers.map((r) => ({
      src: r.profileImage || '',
      alt: r.fullName,
      authorId: r.authorProfileId,
      tooltip: r.fullName,
    }));
  }, [consensusReview.reviewerIds, data.reviewers]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Consensus Review Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-gray-900" />
          AI Review
        </h2>

        {/* Funding Potential — primary signal */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm text-gray-700">Funding Potential:</span>
          <span className={cn('text-sm font-semibold', fqConfig.text)}>{fqConfig.label}</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Based on {issueLabel(totalIssues).toLowerCase()} across all categories
        </p>

        {/* Consensus summary */}
        <div className="border-l-[3px] border-gray-300 pl-3 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{consensusReview.summary}</p>
        </div>

        {/* Reviewed by + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Reviewed by
            </span>
            {reviewerAvatars.length > 0 && (
              <AvatarStack
                items={reviewerAvatars}
                size="xs"
                maxItems={5}
                spacing={-8}
                showExtraCount
                showLabel={false}
              />
            )}
          </div>
          <Tooltip
            content="Quality validations picked by the ResearchHub Foundation will earn $150"
            position="top"
            width="w-64"
          >
            <Button
              type="button"
              variant={showEditor ? 'outlined' : 'default'}
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setShowEditor((prev) => !prev)}
            >
              <ClipboardCheck className="w-4 h-4" />
              Validate AI Review for $150
            </Button>
          </Tooltip>
        </div>

        {/* Inline Comment Editor */}
        {showEditor && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <CommentEditor
              onSubmit={async () => {
                setShowEditor(false);
                return true;
              }}
              onCancel={() => setShowEditor(false)}
              placeholder="Write your review of the AI assessment..."
              commentType="GENERIC_COMMENT"
              storageKey="ai-review-validation-editor"
              showHeader={false}
            />
          </div>
        )}
      </div>

      {/* Category Accordions */}
      <Accordion className="gap-3">
        {data.categories.map((category) => (
          <CategoryAccordionBlock key={category.id} category={category} />
        ))}
      </Accordion>
    </div>
  );
}

function CategoryAccordionBlock({ category }: { category: CategoryDefinition }) {
  const issues = categoryIssueCount(category);

  const title = (
    <div className="flex items-center justify-between w-full pr-2">
      <span className="font-semibold text-gray-900">{category.title}</span>
      <div className="flex items-center gap-1.5">
        <FontAwesomeIcon
          icon={issues === 0 ? faCircleCheck : faCircleExclamation}
          className={cn('w-3.5 h-3.5', issues === 0 ? 'text-emerald-500' : 'text-red-500')}
        />
        <span
          className={cn('text-xs font-medium', issues === 0 ? 'text-emerald-700' : 'text-red-600')}
        >
          {issueLabel(issues)}
        </span>
      </div>
    </div>
  );

  return (
    <AccordionItem title={title} defaultOpen={false} className="!border-gray-200">
      <div className="space-y-6 pt-2">
        {category.subcategories.map((sub) => (
          <section key={sub.id}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">
              {sub.title}
            </h3>
            <div className="divide-y divide-gray-100">
              {sub.checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-900">{item.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <FontAwesomeIcon
                      icon={item.aiValue === 'YES' ? faCircleCheck : faCircleExclamation}
                      className={cn(
                        'w-3.5 h-3.5',
                        item.aiValue === 'YES' ? 'text-emerald-500' : 'text-red-500'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.aiValue === 'YES' ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {item.aiValue === 'YES' ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AccordionItem>
  );
}
