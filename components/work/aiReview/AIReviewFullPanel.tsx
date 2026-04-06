'use client';

import { useMemo, useState } from 'react';
import { Bot, ClipboardCheck } from 'lucide-react';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { AIReviewSpectrumBar } from './AIReviewSpectrumBar';
import { AIReviewChecklistRow } from './AIReviewChecklistRow';
import { AIReviewValidationModal } from './AIReviewValidationModal';
import { useAIReviewMock } from './AIReviewMockContext';
import {
  categoryScore,
  overallSpectrumPercent,
  scoreBandLabel,
  scoreBandStyles,
  subcategoryScore,
} from './scoring';
import type { CategoryDefinition } from './types';
import { collectReviewerIdsForCategories, reviewersFromIds } from './collectReviewers';

export function AIReviewFullPanel({ className }: { className?: string }) {
  const { data, userValidations } = useAIReviewMock();
  const { user } = useUser();
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  // For the POC, pin the overall score at 60%
  const overall = 60;

  const hasUserValidations = Object.keys(userValidations).length > 0;

  const topAvatars = useMemo(() => {
    const ids = collectReviewerIdsForCategories(data.categories);
    const items = reviewersFromIds(ids, data.reviewers).map((r) => ({
      src: r.profileImage || '',
      alt: r.fullName,
      authorId: r.authorProfileId,
      tooltip: r.fullName,
    }));
    if (user?.authorProfile && hasUserValidations) {
      return [
        {
          src: user.authorProfile.profileImage || '',
          alt: 'You',
          authorId: user.authorProfile.id,
          tooltip: 'You validated checklist items',
        },
        ...items,
      ];
    }
    return items;
  }, [data.categories, data.reviewers, user?.authorProfile, hasUserValidations]);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-gray-900" />
          AI Review
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Automated assessment across fundability, feasibility, novelty, impact, and
          reproducibility.
        </p>
        <AIReviewSpectrumBar percent={overall} />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Validated by
            </span>
            {topAvatars.length > 0 && (
              <AvatarStack
                items={topAvatars}
                size="xs"
                maxItems={5}
                spacing={-8}
                showExtraCount
                showLabel={false}
              />
            )}
          </div>
          <Tooltip
            content="Quality validations picked by the ResearchHub Foundation will earn $50"
            position="top"
            width="w-64"
          >
            <Button
              type="button"
              variant={hasUserValidations ? 'outlined' : 'default'}
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setIsValidationModalOpen(true)}
            >
              <ClipboardCheck className="w-4 h-4" />
              {hasUserValidations ? 'Edit Review' : 'Validate Review for $50'}
            </Button>
          </Tooltip>
        </div>
      </div>

      <AIReviewValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
      />

      <Accordion className="gap-3">
        {data.categories.map((category) => (
          <CategoryAccordionBlock key={category.id} category={category} />
        ))}
      </Accordion>
    </div>
  );
}

function CategoryAccordionBlock({ category }: { category: CategoryDefinition }) {
  const band = categoryScore(category);
  const styles = scoreBandStyles(band);

  const title = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', styles.dot)} aria-hidden />
      <span className="font-semibold text-gray-900">{category.title}</span>
      <span
        className={cn(
          'text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border',
          styles.text,
          styles.bg,
          styles.border
        )}
      >
        {scoreBandLabel(band)}
      </span>
    </div>
  );

  return (
    <AccordionItem title={title} defaultOpen={false} className="!border-gray-200">
      <div className="space-y-10 pt-2">
        {category.subcategories.map((sub) => {
          const subBand = subcategoryScore(category, sub.id);
          const subStyles = scoreBandStyles(subBand);
          return (
            <section key={sub.id}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {sub.title}
                </h3>
                <span
                  className={cn(
                    'text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border',
                    subStyles.text,
                    subStyles.bg,
                    subStyles.border
                  )}
                >
                  {scoreBandLabel(subBand)}
                </span>
              </div>
              <div className="border-l-[3px] border-gray-300 pl-3 py-2 mb-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-700">Summary: </span>
                  {sub.summary}
                </p>
              </div>
              <div>
                {/* Column headers */}
                <div
                  className="flex items-center mb-2 pb-1 border-b border-gray-200"
                  style={{ gap: 15 }}
                >
                  <span className="flex-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Item
                  </span>
                  <span
                    className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide shrink-0 text-left"
                    style={{ width: 72 }}
                  >
                    AI
                  </span>
                  <span
                    className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide shrink-0 text-left"
                    style={{ width: 120 }}
                  >
                    Human
                  </span>
                </div>
                {sub.checklist.map((item) => (
                  <AIReviewChecklistRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AccordionItem>
  );
}
