'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, CircleAlert, Sparkles, Users } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { useUser } from '@/contexts/UserContext';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PillTab, PillTabs } from '@/components/ui/PillTabs';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Textarea } from '@/components/ui/form/Textarea';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import {
  AIReviewCategory,
  AIReviewChecklistItem,
  AIReviewer,
  HumanValidation,
  ProposalAIReviewData,
  ReviewDecision,
  ReviewLevel,
  getCategoryLevel,
  getOverallReviewLabel,
  getOverallReviewScore,
  getSubcategoryLevel,
  proposalAIReviewData,
} from './mockData';

type ReviewView = 'ai' | 'people';
type ViewerValidationMap = Record<string, HumanValidation>;

const decisionStyles: Record<ReviewDecision, string> = {
  yes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  no: 'bg-rose-50 text-rose-700 border-rose-200',
};

const levelStyles: Record<ReviewLevel, string> = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-rose-50 text-rose-700 border-rose-200',
};

const levelAccentStyles: Record<ReviewLevel, string> = {
  high: 'bg-emerald-500',
  medium: 'bg-amber-500',
  low: 'bg-rose-500',
};

const decisionLabel: Record<ReviewDecision, string> = {
  yes: 'Yes',
  partial: 'Partial',
  no: 'No',
};

const levelLabel: Record<ReviewLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function formatGeneratedDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

function getCombinedValidations(
  item: AIReviewChecklistItem,
  viewerValidations: ViewerValidationMap
): HumanValidation[] {
  const viewerValidation = viewerValidations[item.id];
  if (!viewerValidation) {
    return item.validations;
  }

  const withoutViewer = item.validations.filter(
    (validation) => validation.reviewerId !== viewerValidation.reviewerId
  );
  return [...withoutViewer, viewerValidation];
}

function getCategoryReviewerCounts(
  category: AIReviewCategory,
  viewerValidations: ViewerValidationMap
): Record<number, number> {
  const counts: Record<number, number> = {};

  category.subcategories.forEach((subcategory) => {
    subcategory.checklist.forEach((item) => {
      getCombinedValidations(item, viewerValidations).forEach((validation) => {
        counts[validation.reviewerId] = (counts[validation.reviewerId] || 0) + 1;
      });
    });
  });

  return counts;
}

function getOverallReviewerCounts(
  data: ProposalAIReviewData,
  viewerValidations: ViewerValidationMap
): Record<number, number> {
  const counts: Record<number, number> = {};

  data.categories.forEach((category) => {
    Object.entries(getCategoryReviewerCounts(category, viewerValidations)).forEach(
      ([reviewerId, count]) => {
        counts[Number(reviewerId)] = (counts[Number(reviewerId)] || 0) + count;
      }
    );
  });

  return counts;
}

function buildReviewerTooltip(reviewer: AIReviewer, count: number, scopeLabel: string): ReactNode {
  return (
    <div className="text-left">
      <div className="font-semibold text-gray-900">{reviewer.fullName}</div>
      <div className="text-xs text-gray-500">{reviewer.headline}</div>
      <div className="mt-2 text-xs text-gray-700">
        Reviewed {count} checklist {count === 1 ? 'item' : 'items'} in {scopeLabel}.
      </div>
    </div>
  );
}

function buildValidationTooltip(
  validation: HumanValidation,
  reviewer: AIReviewer,
  itemDecision: ReviewDecision
): ReactNode {
  const agrees = validation.decision === itemDecision;

  return (
    <div className="text-left">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{reviewer.fullName}</span>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
            decisionStyles[validation.decision]
          )}
        >
          {decisionLabel[validation.decision]}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{reviewer.headline}</div>
      <div className="mt-2 text-xs font-medium text-gray-700">
        {agrees ? 'Agrees with the AI assessment' : 'Flags a mismatch with the AI assessment'}
      </div>
      {validation.note && <div className="mt-1 text-xs text-gray-700">{validation.note}</div>}
    </div>
  );
}

function HumanReviewSignal({
  data,
  viewerValidations,
  reviewers,
}: {
  data: ProposalAIReviewData;
  viewerValidations: ViewerValidationMap;
  reviewers: Record<number, AIReviewer>;
}) {
  const overallReviewerCounts = getOverallReviewerCounts(data, viewerValidations);
  const items = Object.entries(overallReviewerCounts)
    .sort(([, left], [, right]) => right - left)
    .map(([reviewerId, count]) => {
      const reviewer = reviewers[Number(reviewerId)];
      return {
        src: reviewer?.profileImage || '',
        alt: reviewer?.fullName || 'Reviewer',
        tooltipContent: reviewer ? buildReviewerTooltip(reviewer, count, 'this review') : undefined,
      };
    });

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
        No human validation yet.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <AvatarStack
        items={items}
        size="xs"
        maxItems={4}
        spacing={-6}
        showExtraCount
        showLabel={false}
        extraCountLabel="reviewers"
      />
      <div className="text-sm text-gray-600">
        Validated by <span className="font-semibold text-gray-900">{items.length}</span> people
      </div>
    </div>
  );
}

function ReviewGauge({ score }: { score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">{getOverallReviewLabel(score)}</span>
        <span className="text-gray-500">{score}/100</span>
      </div>
      <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 p-[2px]">
        <div className="relative h-full rounded-full bg-white/85">
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-gray-900 shadow-sm"
            style={{ left: `calc(${score}% - 8px)` }}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: ReviewLevel;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn('h-2.5 w-2.5 rounded-full', levelAccentStyles[tone])} />
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

function ValidationEditor({
  item,
  currentValidation,
  isOpen,
  onOpen,
  onCancel,
  onSave,
}: {
  item: AIReviewChecklistItem;
  currentValidation?: HumanValidation;
  isOpen: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onSave: (decision: ReviewDecision, note: string) => void;
}) {
  const [draftDecision, setDraftDecision] = useState<ReviewDecision>(
    currentValidation?.decision || item.decision
  );
  const [draftNote, setDraftNote] = useState(currentValidation?.note || '');

  useEffect(() => {
    if (!isOpen) return;
    setDraftDecision(currentValidation?.decision || item.decision);
    setDraftNote(currentValidation?.note || '');
  }, [currentValidation?.decision, currentValidation?.note, isOpen, item.decision]);

  if (!isOpen) {
    return (
      <Button variant="outlined" size="sm" onClick={onOpen} className="shrink-0">
        {currentValidation ? 'Update validation' : 'Validate'}
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-primary-100 bg-primary-50/40 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
        Human validation
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(['yes', 'partial', 'no'] as ReviewDecision[]).map((decision) => (
          <button
            key={decision}
            type="button"
            onClick={() => setDraftDecision(decision)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              draftDecision === decision
                ? decisionStyles[decision]
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            )}
          >
            {decisionLabel[decision]}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Textarea
          value={draftNote}
          onChange={(event) => setDraftNote(event.target.value)}
          placeholder="Add a short note about why you agree or disagree."
          className="bg-white"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={() => onSave(draftDecision, draftNote)}>
          Save validation
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ChecklistItemRow({
  item,
  reviewers,
  viewerValidations,
  isEditing,
  onStartEditing,
  onCancelEditing,
  onSaveValidation,
}: {
  item: AIReviewChecklistItem;
  reviewers: Record<number, AIReviewer>;
  viewerValidations: ViewerValidationMap;
  isEditing: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveValidation: (decision: ReviewDecision, note: string) => void;
}) {
  const currentValidation = viewerValidations[item.id];
  const validations = getCombinedValidations(item, viewerValidations);

  const avatarItems = validations.map((validation) => {
    const reviewer = reviewers[validation.reviewerId];
    const agrees = validation.decision === item.decision;

    return {
      src: reviewer?.profileImage || '',
      alt: reviewer?.fullName || 'Reviewer',
      tooltipContent: reviewer
        ? buildValidationTooltip(validation, reviewer, item.decision)
        : undefined,
      badge: agrees ? (
        <div className="rounded-full bg-emerald-500 p-[1px] text-white shadow-sm">
          <CheckCircle2 className="h-3 w-3" />
        </div>
      ) : (
        <div className="rounded-full bg-amber-500 p-[1px] text-white shadow-sm">
          <CircleAlert className="h-3 w-3" />
        </div>
      ),
    };
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{item.label}</span>
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
                decisionStyles[item.decision]
              )}
            >
              {decisionLabel[item.decision]}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {avatarItems.length > 0 ? (
              <AvatarStack
                items={avatarItems}
                size="xs"
                maxItems={4}
                spacing={-6}
                showExtraCount
                showLabel={false}
                extraCountLabel="validators"
              />
            ) : (
              <div className="text-xs text-gray-400">No human validations yet.</div>
            )}
            {avatarItems.length > 0 && (
              <div className="text-xs text-gray-500">
                {avatarItems.length} validation{avatarItems.length === 1 ? '' : 's'}
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-[260px]">
          <ValidationEditor
            item={item}
            currentValidation={currentValidation}
            isOpen={isEditing}
            onOpen={onStartEditing}
            onCancel={onCancelEditing}
            onSave={onSaveValidation}
          />
        </div>
      </div>
    </div>
  );
}

function CategoryAccordion({
  category,
  data,
  viewerValidations,
  reviewers,
  editingItemId,
  onStartEditing,
  onCancelEditing,
  onSaveValidation,
}: {
  category: AIReviewCategory;
  data: ProposalAIReviewData;
  viewerValidations: ViewerValidationMap;
  reviewers: Record<number, AIReviewer>;
  editingItemId: string | null;
  onStartEditing: (itemId: string) => void;
  onCancelEditing: () => void;
  onSaveValidation: (itemId: string, decision: ReviewDecision, note: string) => void;
}) {
  const categoryLevel = getCategoryLevel(category);
  const reviewerCounts = getCategoryReviewerCounts(category, viewerValidations);
  const reviewerItems = Object.entries(reviewerCounts)
    .sort(([, left], [, right]) => right - left)
    .map(([reviewerId, count]) => {
      const reviewer = reviewers[Number(reviewerId)];
      return {
        src: reviewer?.profileImage || '',
        alt: reviewer?.fullName || 'Reviewer',
        tooltipContent: reviewer
          ? buildReviewerTooltip(reviewer, count, category.title)
          : undefined,
      };
    });

  return (
    <AccordionItem
      defaultOpen={category.id === data.categories[0]?.id}
      title={
        <div className="flex min-w-0 items-center gap-3 pr-4">
          <span className={cn('h-3 w-3 rounded-full', levelAccentStyles[categoryLevel])} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-gray-900">{category.title}</span>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
                  levelStyles[categoryLevel]
                )}
              >
                {levelLabel[categoryLevel]}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {category.subcategories.length} subcategories
            </div>
          </div>
          {reviewerItems.length > 0 && (
            <AvatarStack
              items={reviewerItems}
              size="xxs"
              maxItems={4}
              spacing={-5}
              showExtraCount
              showLabel={false}
              extraCountLabel="reviewers"
              className="hidden sm:inline-flex"
            />
          )}
        </div>
      }
      className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
      buttonClassName="bg-white px-5 py-4"
      panelClassName="bg-gray-50 px-5 pb-5 pt-0"
    >
      <div className="space-y-4">
        {category.subcategories.map((subcategory) => {
          const subcategoryLevel = getSubcategoryLevel(subcategory);

          return (
            <div key={subcategory.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-700">
                  {subcategory.title}
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
                    levelStyles[subcategoryLevel]
                  )}
                >
                  {levelLabel[subcategoryLevel]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{subcategory.summary}</p>

              <div className="mt-4 space-y-3">
                {subcategory.checklist.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    reviewers={reviewers}
                    viewerValidations={viewerValidations}
                    isEditing={editingItemId === item.id}
                    onStartEditing={() => onStartEditing(item.id)}
                    onCancelEditing={onCancelEditing}
                    onSaveValidation={(decision, note) => onSaveValidation(item.id, decision, note)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AccordionItem>
  );
}

function AIReviewPanel({
  data,
  viewerValidations,
  reviewers,
  editingItemId,
  onStartEditing,
  onCancelEditing,
  onSaveValidation,
}: {
  data: ProposalAIReviewData;
  viewerValidations: ViewerValidationMap;
  reviewers: Record<number, AIReviewer>;
  editingItemId: string | null;
  onStartEditing: (itemId: string) => void;
  onCancelEditing: () => void;
  onSaveValidation: (itemId: string, decision: ReviewDecision, note: string) => void;
}) {
  const score = getOverallReviewScore(data.categories);
  const mediumOrAboveCount = data.categories.filter((category) => {
    const level = getCategoryLevel(category);
    return level === 'high' || level === 'medium';
  }).length;

  const weakestCategory = [...data.categories].sort((left, right) => {
    const order: Record<ReviewLevel, number> = { low: 0, medium: 1, high: 2 };
    return order[getCategoryLevel(left)] - order[getCategoryLevel(right)];
  })[0];

  return (
    <section id="ai-review" className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Review
              </Badge>
              <Badge variant="default" size="sm">
                {data.modelLabel}
              </Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Proposal review triaged across five funding dimensions
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Scores are propagated from checklist decisions into subcategory and category ratings,
              with human validators able to confirm or challenge each AI claim.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Generated on{' '}
            <span className="font-semibold text-gray-900">
              {formatGeneratedDate(data.generatedAt)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <ReviewGauge score={score} />
            <div className="mt-5">
              <HumanReviewSignal
                data={data}
                viewerValidations={viewerValidations}
                reviewers={reviewers}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <SummaryMetric
              label="Categories"
              value={`${mediumOrAboveCount} of ${data.categories.length} medium or above`}
              tone="high"
            />
            <SummaryMetric
              label="Watch Item"
              value={`${weakestCategory.title} is the weakest dimension`}
              tone={getCategoryLevel(weakestCategory)}
            />
          </div>
        </div>
      </div>

      <Accordion className="gap-5 bg-transparent">
        {data.categories.map((category) => (
          <CategoryAccordion
            key={category.id}
            category={category}
            data={data}
            viewerValidations={viewerValidations}
            reviewers={reviewers}
            editingItemId={editingItemId}
            onStartEditing={onStartEditing}
            onCancelEditing={onCancelEditing}
            onSaveValidation={onSaveValidation}
          />
        ))}
      </Accordion>
    </section>
  );
}

export function AIReviewSidebarSection({ reviewsUrl }: { reviewsUrl: string }) {
  const score = getOverallReviewScore(proposalAIReviewData.categories);
  const overallCounts = getOverallReviewerCounts(proposalAIReviewData, {});
  const reviewerItems = Object.entries(overallCounts)
    .sort(([, left], [, right]) => right - left)
    .map(([reviewerId, count]) => {
      const reviewer = proposalAIReviewData.reviewers[Number(reviewerId)];
      return {
        src: reviewer?.profileImage || '',
        alt: reviewer?.fullName || 'Reviewer',
        tooltipContent: reviewer ? buildReviewerTooltip(reviewer, count, 'this review') : undefined,
      };
    });

  return (
    <div>
      <SidebarHeader
        title="AI Review"
        className="mb-3"
        action={
          <Badge variant="primary" size="xs">
            New
          </Badge>
        }
      />

      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-white to-primary-50/40 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Bot className="h-4 w-4 text-primary-600" />
              Automated proposal screen
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Generated {formatGeneratedDate(proposalAIReviewData.generatedAt)}
            </div>
          </div>
          <Tooltip
            content={
              <div className="text-left">
                <div className="font-semibold text-gray-900">Overall score</div>
                <div className="mt-1 text-xs text-gray-700">
                  {score}/100 with a {getOverallReviewLabel(score).toLowerCase()} funding outlook.
                </div>
              </div>
            }
            position="top"
            width="w-48"
          >
            <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-900">
              {score}/100
            </div>
          </Tooltip>
        </div>

        <div className="mt-4">
          <ReviewGauge score={score} />
        </div>

        {reviewerItems.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-500">Human reviewed</div>
            <AvatarStack
              items={reviewerItems}
              size="xxs"
              maxItems={4}
              spacing={-5}
              showExtraCount
              showLabel={false}
              extraCountLabel="reviewers"
            />
          </div>
        )}

        <div className="mt-4 space-y-2">
          {proposalAIReviewData.categories.map((category) => {
            const level = getCategoryLevel(category);
            return (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', levelAccentStyles[level])} />
                  <span className="text-sm font-medium text-gray-800">{category.title}</span>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
                    levelStyles[level]
                  )}
                >
                  {levelLabel[level]}
                </span>
              </div>
            );
          })}
        </div>

        <Link
          href={`${reviewsUrl}#ai-review`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
        >
          Open full AI review
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function ProposalReviewsPanel({
  work,
  metadata,
  storageKey,
}: {
  work: Work;
  metadata: WorkMetadata;
  storageKey: string;
}) {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<ReviewView>('ai');
  const [viewerValidations, setViewerValidations] = useState<ViewerValidationMap>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const viewerReviewerId = user?.authorProfile?.id ? user.authorProfile.id + 1000000 : 999001;

  const viewerReviewer: AIReviewer = {
    id: viewerReviewerId,
    fullName: user?.authorProfile?.fullName || user?.fullName || 'You',
    profileImage: user?.authorProfile?.profileImage || '',
    headline: user?.authorProfile?.headline || 'Current reviewer',
  };

  const reviewers = {
    ...proposalAIReviewData.reviewers,
    [viewerReviewer.id]: viewerReviewer,
  };

  const tabs: PillTab[] = [
    {
      id: 'ai',
      label: (
        <span className="inline-flex items-center gap-2">
          <Bot className="h-3.5 w-3.5" />
          <span>AI</span>
          <span className="rounded-full border border-primary-200 bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-800">
            New
          </span>
        </span>
      ),
    },
    {
      id: 'people',
      label: (
        <span className="inline-flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          <span>People</span>
        </span>
      ),
    },
  ];

  const saveValidation = (itemId: string, decision: ReviewDecision, note: string) => {
    setViewerValidations((current) => ({
      ...current,
      [itemId]: {
        reviewerId: viewerReviewer.id,
        decision,
        note: note.trim(),
      },
    }));
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      <ReviewStatusBanner bounties={metadata.bounties || []} />

      <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <PillTabs
          tabs={tabs}
          activeTab={activeView}
          onTabChange={(tabId) => setActiveView(tabId as ReviewView)}
          size="sm"
          colorScheme="indigo"
        />
      </div>

      {activeView === 'ai' ? (
        <AIReviewPanel
          data={proposalAIReviewData}
          viewerValidations={viewerValidations}
          reviewers={reviewers}
          editingItemId={editingItemId}
          onStartEditing={(itemId) => setEditingItemId(itemId)}
          onCancelEditing={() => setEditingItemId(null)}
          onSaveValidation={saveValidation}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 text-gray-500" />
              People reviews
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Open reviews from the community live here. Use the AI tab to inspect the structured
              screening output and validate individual checklist claims.
            </p>
          </div>
          <CommentFeed
            unifiedDocumentId={work.unifiedDocumentId || null}
            documentId={work.id}
            contentType={work.contentType}
            commentType="REVIEW"
            key={`review-feed-${work.id}`}
            workAuthors={work.authors}
            editorProps={{
              placeholder: 'Write your review...',
              initialRating: 0,
              commentType: 'REVIEW',
              storageKey: `${storageKey}-review-feed-${work.id}`,
            }}
            work={work}
          />
        </div>
      )}
    </div>
  );
}
