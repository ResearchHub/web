'use client';

import { useMemo } from 'react';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { AIReviewSpectrumBar } from './AIReviewSpectrumBar';
import { AIReviewChecklistRow } from './AIReviewChecklistRow';
import { useAIReviewMock } from './AIReviewMockContext';
import {
  categoryScore,
  overallSpectrumPercent,
  scoreBandLabel,
  scoreBandStyles,
  subcategoryScore,
} from './scoring';
import type { CategoryDefinition, MockReviewer } from './types';
import {
  categoryHasUserValidation,
  collectReviewerIdsForCategories,
  reviewersFromIds,
} from './collectReviewers';
import { PeerReviewAvatarCluster } from './PeerReviewAvatarCluster';
import { clusterItemsForCategory, clusterItemsForSubcategory } from './peerReviewClusterUtils';

export function AIReviewFullPanel({ className }: { className?: string }) {
  const { data, userValidations } = useAIReviewMock();
  const { user } = useUser();

  const overall = overallSpectrumPercent(data.categories);

  const topAvatars = useMemo(() => {
    const ids = collectReviewerIdsForCategories(data.categories);
    const items = reviewersFromIds(ids, data.reviewers).map((r) => ({
      src: r.profileImage || '',
      alt: r.fullName,
      authorId: r.authorProfileId,
      tooltip: r.fullName,
    }));
    if (user?.authorProfile && Object.keys(userValidations).length > 0) {
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
  }, [data.categories, data.reviewers, user?.authorProfile, userValidations]);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI proposal review</h2>
        <p className="text-sm text-gray-600 mb-4">
          Automated assessment across fundability, feasibility, novelty, impact, and
          reproducibility. Human reviewers can validate individual checklist items; their avatars
          roll up to each section and the summary below.
        </p>
        <AIReviewSpectrumBar percent={overall} />
        {topAvatars.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Human validation
            </span>
            <AvatarStack
              items={topAvatars}
              size="xs"
              maxItems={5}
              spacing={-8}
              showExtraCount
              showLabel={false}
            />
          </div>
        )}
      </div>

      <Accordion className="gap-3">
        {data.categories.map((category) => (
          <CategoryAccordionBlock
            key={category.id}
            category={category}
            humanById={data.reviewers}
            userValidations={userValidations}
            user={user}
          />
        ))}
      </Accordion>
    </div>
  );
}

function CategoryAccordionBlock({
  category,
  humanById,
  userValidations,
  user,
}: {
  category: CategoryDefinition;
  humanById: Record<string, MockReviewer>;
  userValidations: Record<string, unknown>;
  user: ReturnType<typeof useUser>['user'];
}) {
  const band = categoryScore(category);
  const styles = scoreBandStyles(band);
  const catCluster = clusterItemsForCategory(category, humanById);
  const showYou =
    Boolean(user?.authorProfile) && categoryHasUserValidation(category, userValidations);

  const title = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
      <span className={cn('h-2 w-2 rounded-full shrink-0', styles.dot)} aria-hidden />
      <span className="font-semibold text-gray-900">{category.title}</span>
      <span className={cn('text-xs font-bold', styles.text)}>{scoreBandLabel(band)}</span>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <PeerReviewAvatarCluster items={catCluster} maxShown={4} />
        {showYou && user?.authorProfile && (
          <Tooltip content="You validated one or more items in this category" position="top">
            <Avatar
              src={user.authorProfile.profileImage}
              alt="You"
              size="xxs"
              authorId={user.authorProfile.id}
              className="ring-2 ring-primary-300"
              disableTooltip
            />
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <AccordionItem title={title} defaultOpen={false} className="!border-gray-200">
      <div className="space-y-10 pt-2">
        {category.subcategories.map((sub) => {
          const subBand = subcategoryScore(category, sub.id);
          const subStyles = scoreBandStyles(subBand);
          const subCluster = clusterItemsForSubcategory(sub, humanById);
          const subShowYou =
            Boolean(user?.authorProfile) &&
            sub.checklist.some((c) => userValidations[c.id] !== undefined);

          return (
            <section key={sub.id}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {sub.title}
                    </h3>
                    <span
                      className={cn(
                        'text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border',
                        subStyles.text,
                        subBand === 'LOW'
                          ? 'bg-red-50 border-red-200'
                          : subBand === 'MEDIUM'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-emerald-50 border-emerald-200'
                      )}
                    >
                      {scoreBandLabel(subBand)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PeerReviewAvatarCluster items={subCluster} maxShown={3} />
                  {subShowYou && user?.authorProfile && (
                    <Tooltip content="You validated an item under this subcategory" position="top">
                      <Avatar
                        src={user.authorProfile.profileImage}
                        alt="You"
                        size="xxs"
                        authorId={user.authorProfile.id}
                        className="ring-2 ring-primary-200"
                        disableTooltip
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                <span className="font-semibold text-gray-800">Summary: </span>
                {sub.summary}
              </p>
              <div>
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
