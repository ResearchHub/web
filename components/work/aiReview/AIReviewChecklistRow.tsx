'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import type { ChecklistItemDefinition } from './types';
import { ChecklistValueBadge } from './ChecklistValueBadge';
import { PeerReviewAvatarCluster } from './PeerReviewAvatarCluster';
import { useAIReviewMock } from './AIReviewMockContext';
import type { ChecklistValue } from './types';

interface AIReviewChecklistRowProps {
  item: ChecklistItemDefinition;
}

export function AIReviewChecklistRow({ item }: AIReviewChecklistRowProps) {
  const { data, userValidations, setUserValidation } = useAIReviewMock();
  const { user } = useUser();
  const [validating, setValidating] = useState(false);
  const [draftValue, setDraftValue] = useState<ChecklistValue | null>(null);
  const [draftNote, setDraftNote] = useState('');

  const clusterItems = useMemo(
    () =>
      item.humanReviews
        .map((review) => ({
          review,
          reviewer: data.reviewers[review.reviewerId],
        }))
        .filter((x) => x.reviewer),
    [item.humanReviews, data.reviewers]
  );

  const mine = userValidations[item.id];
  const profile = user?.authorProfile;

  const openValidate = () => {
    setValidating(true);
    setDraftValue(mine?.value ?? null);
    setDraftNote(mine?.note ?? '');
  };

  const submit = () => {
    if (draftValue === null) return;
    setUserValidation(item.id, { value: draftValue, note: draftNote.trim() || undefined });
    setValidating(false);
  };

  const clearMine = () => {
    setUserValidation(item.id, null);
    setValidating(false);
  };

  return (
    <div className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-gray-900 flex-1 min-w-0 leading-snug">{item.label}</p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ChecklistValueBadge value={item.aiValue} />
          <PeerReviewAvatarCluster items={clusterItems} />
          {mine && profile && (
            <Tooltip
              content={
                <div className="text-left text-xs">
                  <div className="font-semibold">Your validation</div>
                  <div className="mt-1">
                    <ChecklistValueBadge value={mine.value} className="text-[10px]" />
                  </div>
                  {mine.note ? <p className="mt-2 text-gray-700">{mine.note}</p> : null}
                </div>
              }
              position="top"
              width="w-72"
            >
              <div className="relative inline-flex">
                <Avatar
                  src={profile.profileImage}
                  alt={profile.fullName || 'You'}
                  size="xxs"
                  authorId={profile.id}
                  className="ring-2 ring-primary-200"
                  disableTooltip
                />
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white bg-primary-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
                </span>
              </div>
            </Tooltip>
          )}
          {mine && !profile && <span className="text-[11px] text-gray-600">You reviewed</span>}
          <Button
            type="button"
            variant="outlined"
            size="sm"
            className="h-8 text-xs"
            onClick={openValidate}
          >
            {mine ? 'Edit' : 'Validate'}
          </Button>
        </div>
      </div>

      {validating && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3 space-y-3">
          <p className="text-xs font-medium text-gray-700">
            Your assessment of this checklist item
          </p>
          <div className="flex flex-wrap gap-2">
            {(['YES', 'PARTIAL', 'NO'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setDraftValue(v)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                  draftValue === v
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                {v === 'YES' ? 'Yes' : v === 'PARTIAL' ? 'Partial' : 'No'}
              </button>
            ))}
          </div>
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Optional note (visible on hover)"
            className="w-full rounded-md border border-gray-200 text-sm p-2 min-h-[72px] focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={draftValue === null} onClick={submit}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setValidating(false)}>
              Cancel
            </Button>
            {mine ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={clearMine}
              >
                Clear my response
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
