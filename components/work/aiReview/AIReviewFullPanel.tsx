'use client';

import { useMemo, useState } from 'react';
import { ClipboardCheck, Sparkles } from 'lucide-react';
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
  LOW: { label: 'Unsafe to fund', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  MEDIUM: {
    label: 'Unclear if safe to fund',
    text: 'text-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  HIGH: {
    label: 'Safe to fund',
    text: 'text-emerald-600',
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

  // Derive strengths and concerns from checklist items across all categories
  const { strengths, concerns } = useMemo(() => {
    const s: string[] = [];
    const c: string[] = [];
    for (const cat of data.categories) {
      for (const sub of cat.subcategories) {
        for (const item of sub.checklist) {
          if (item.aiValue === 'YES') {
            s.push(item.label);
          } else {
            c.push(item.label);
          }
        }
      }
    }
    return { strengths: s.slice(0, 5), concerns: c.slice(0, 5) };
  }, [data.categories]);

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
          <Sparkles className="w-5 h-5 text-primary-500" />
          AI Peer Review Summary
        </h2>

        {/* Consensus — primary signal */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm text-gray-700">Consensus:</span>
          <span className={cn('text-sm font-semibold', fqConfig.text)}>{fqConfig.label}</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Based on {issueLabel(totalIssues).toLowerCase()} across all categories
        </p>

        {/* Consensus summary */}
        <div className="border-l-[3px] border-gray-300 pl-3 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {consensusReview.summary}
          </p>
        </div>

        {/* Strengths & Concerns */}
        {(strengths.length > 0 || concerns.length > 0) && (
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strengths.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-wider mb-1.5">
                    Strengths
                  </h5>
                  <ul className="space-y-1.5">
                    {strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-gray-600 leading-snug flex items-start gap-1.5"
                      >
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {concerns.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1.5">
                    Concerns
                  </h5>
                  <ul className="space-y-1.5">
                    {concerns.map((c, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-gray-600 leading-snug flex items-start gap-1.5"
                      >
                        <FontAwesomeIcon
                          icon={faCircleExclamation}
                          className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0"
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

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
          className={cn('w-3.5 h-3.5', issues === 0 ? 'text-emerald-400' : 'text-red-400')}
        />
        <span
          className={cn('text-xs font-medium', issues === 0 ? 'text-emerald-600' : 'text-red-500')}
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
                        item.aiValue === 'YES' ? 'text-emerald-400' : 'text-red-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.aiValue === 'YES' ? 'text-emerald-600' : 'text-red-500'
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
