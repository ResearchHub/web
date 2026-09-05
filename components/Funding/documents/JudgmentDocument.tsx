'use client';

import { Check, Sparkles, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/utils/styles';
import { DocumentSection } from './DocumentSection';
import type { JudgmentMode, JudgmentPolicy, JudgmentSectionId } from './types';

const MODES: { id: JudgmentMode; title: string; description: string; icon: typeof Sparkles }[] = [
  {
    id: 'ai',
    title: 'AI-managed',
    description: 'Disburses to proposals that clear the review bar, holds the rest.',
    icon: Sparkles,
  },
  {
    id: 'self',
    title: 'Self-managed',
    description: 'Reviews and recommends; the funder releases every dollar.',
    icon: UserRound,
  },
];

const formatUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;

/**
 * The policy as prose. Every clause traces to a field, so the paragraph is
 * always exactly what the controls say — this is the text the assistant reads
 * back to the funder and the text an org page would show as "our rules".
 */
export const describeJudgment = (policy: JudgmentPolicy, orgName: string): string[] => {
  const bar = policy.minReviewScore.toFixed(1);

  if (policy.mode === 'self') {
    return [
      `Every proposal is reviewed against a **${bar}** peer-review bar and brought to ${orgName} with a recommendation, but nothing moves until ${orgName} releases it.`,
      `The **${formatUsd(policy.totalBudgetUsd)}** stays committed and unspent until then.`,
    ];
  }

  return [
    `Proposals averaging **${bar} or above** across their peer reviews are funded automatically, at what the applicant asked for and never more than **${formatUsd(policy.maxPerProposalUsd)}** each, out of a **${formatUsd(policy.totalBudgetUsd)}** budget.`,
    `Anything below the bar is **held** for ${orgName}'s review rather than declined. ${
      policy.notifyBeforeDisbursing
        ? `${orgName} is notified before each disbursement.`
        : 'Disbursements are reported afterwards rather than approved one by one.'
    }`,
    'Budget is not spent down for its own sake: a claim that draws no credible proposal keeps its share in reserve.',
  ];
};

/** Renders the `**bold**` runs `describeJudgment` uses, without a markdown pass. */
const Emphasized = ({ text }: { readonly text: string }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith('**') ? (
        <strong key={index} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={index}>{part}</span>
      )
    )}
  </>
);

const SectionHeading = ({ children }: { readonly children: string }) => (
  <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
    {children}
  </h3>
);

interface JudgmentDocumentProps {
  readonly policy: JudgmentPolicy;
  readonly orgName: string;
  /** Shows the policy as active. Controls stay editable: changes apply immediately. */
  readonly confirmed: boolean;
  /** Absent means read-only. */
  readonly onChange?: (patch: Partial<JudgmentPolicy>) => void;
  readonly onConfirm?: () => void;
  readonly highlightSectionId?: JudgmentSectionId | null;
  readonly highlightKey?: string | number | null;
  readonly className?: string;
}

/**
 * The rules the AI must follow to allocate funds. Reads like a policy at the
 * top and edits like a form underneath; moving a slider rewrites the prose.
 */
export const JudgmentDocument = ({
  policy,
  orgName,
  confirmed,
  onChange,
  onConfirm,
  highlightSectionId = null,
  highlightKey = null,
  className,
}: JudgmentDocumentProps) => {
  const isEditable = !!onChange;
  const isAiManaged = policy.mode === 'ai';

  const update = (patch: Partial<JudgmentPolicy>) => {
    if (!isEditable) return;
    onChange?.(patch);
  };

  const section = (id: JudgmentSectionId) => ({
    id,
    highlighted: highlightSectionId === id,
    highlightKey,
  });

  return (
    <div className={cn('text-[15px] leading-relaxed text-gray-800', className)}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {orgName} · Judgment
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
            confirmed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-gray-50 text-gray-500'
          )}
        >
          {confirmed ? 'Active' : 'Draft'}
        </span>
      </div>

      <DocumentSection {...section('policy')}>
        <h1 className="mb-5 mt-2 text-3xl font-bold leading-tight tracking-tight text-gray-900">
          How funds are allocated
        </h1>
        <div className="space-y-4">
          {describeJudgment(policy, orgName).map((paragraph, index) => (
            <p key={index}>
              <Emphasized text={paragraph} />
            </p>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection {...section('mode')} className="mt-9">
        <SectionHeading>Who moves the money</SectionHeading>
        <div className="grid grid-cols-2 gap-2.5">
          {MODES.map((mode) => {
            const isSelected = policy.mode === mode.id;
            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                type="button"
                disabled={!isEditable}
                onClick={() => update({ mode: mode.id })}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors disabled:cursor-default',
                  isSelected
                    ? 'border-primary-500 bg-primary-50/60'
                    : 'border-gray-200 bg-white enabled:hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn('h-4 w-4', isSelected ? 'text-primary-600' : 'text-gray-400')}
                  />
                  <span className="text-sm font-semibold text-gray-900">{mode.title}</span>
                  {isSelected && <Check className="ml-auto h-4 w-4 text-primary-600" />}
                </div>
                <p className="mt-1.5 text-xs leading-snug text-gray-500">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </DocumentSection>

      {isAiManaged && (
        <>
          <DocumentSection {...section('limits')} className="mt-8">
            <SectionHeading>Limits</SectionHeading>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-700">Peer-review bar</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {policy.minReviewScore.toFixed(1)} / 5
                  </span>
                </div>
                <Slider
                  value={[policy.minReviewScore]}
                  min={2.5}
                  max={4.5}
                  step={0.5}
                  disabled={!isEditable}
                  onValueChange={([value]) => update({ minReviewScore: value })}
                />
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-700">Maximum per proposal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatUsd(policy.maxPerProposalUsd)}
                  </span>
                </div>
                <Slider
                  value={[policy.maxPerProposalUsd]}
                  min={50_000}
                  max={400_000}
                  step={50_000}
                  disabled={!isEditable}
                  onValueChange={([value]) => update({ maxPerProposalUsd: value })}
                />
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-700">Total budget cap</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatUsd(policy.totalBudgetUsd)}
                  </span>
                </div>
                <Slider
                  value={[policy.totalBudgetUsd]}
                  min={250_000}
                  max={1_000_000}
                  step={250_000}
                  disabled={!isEditable}
                  onValueChange={([value]) => update({ totalBudgetUsd: value })}
                />
              </div>
            </div>
          </DocumentSection>

          <DocumentSection {...section('notify')} className="mt-8">
            <SectionHeading>Notifications</SectionHeading>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Notify before disbursing</div>
                <p className="text-xs text-gray-500">
                  Otherwise disbursements are reported afterwards.
                </p>
              </div>
              <Switch
                checked={policy.notifyBeforeDisbursing}
                disabled={!isEditable}
                onCheckedChange={(checked) => update({ notifyBeforeDisbursing: checked })}
              />
            </div>
          </DocumentSection>
        </>
      )}

      {confirmed ? (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-3 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4" />
          Policy active
          {isEditable && (
            <span className="font-normal text-emerald-600/80">· edits apply immediately</span>
          )}
        </div>
      ) : (
        onConfirm && (
          <Button
            type="button"
            variant="default"
            className="mt-8 h-12 w-full text-base"
            onClick={onConfirm}
          >
            {isAiManaged ? 'Delegate to AI' : 'Save policy'}
          </Button>
        )
      )}
    </div>
  );
};
