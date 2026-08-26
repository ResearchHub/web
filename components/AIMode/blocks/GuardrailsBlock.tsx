'use client';

import { Check, Sparkles, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/utils/styles';
import { useAIMode } from '../lib/AIModeContext';
import type { GuardrailConfig, GuardrailMode } from '../lib/types';

const MODES: { id: GuardrailMode; title: string; description: string; icon: typeof Sparkles }[] = [
  {
    id: 'ai',
    title: 'AI-managed',
    description: 'I disburse to proposals that clear your review bar, and hold the rest.',
    icon: Sparkles,
  },
  {
    id: 'self',
    title: 'Self-managed',
    description: 'I review and recommend; you release every dollar yourself.',
    icon: UserRound,
  },
];

const formatUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;

interface GuardrailsBlockProps {
  readonly guardrails: GuardrailConfig;
  readonly confirmed: boolean;
}

/**
 * The spending policy. The review bar is a default of 3.5 rather than a
 * control — the funder already picked it in the drafted RFP, so offering it
 * again here is the same decision twice.
 */
export const GuardrailsBlock = ({ guardrails, confirmed }: GuardrailsBlockProps) => {
  const { actions } = useAIMode();
  const isAiManaged = guardrails.mode === 'ai';

  const update = (patch: Partial<GuardrailConfig>) => {
    if (confirmed) return;
    actions.updateGuardrails(patch);
  };

  return (
    <div className="mt-4 max-w-[520px] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-2.5">
        {MODES.map((mode) => {
          const isSelected = guardrails.mode === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={confirmed}
              onClick={() => update({ mode: mode.id })}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors disabled:cursor-default',
                isSelected
                  ? 'border-primary-500 bg-primary-50/60'
                  : 'border-gray-200 bg-white hover:border-gray-300'
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

      <div className="mt-5 space-y-5">
        {isAiManaged && (
          <>
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-700">Maximum per proposal</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatUsd(guardrails.maxPerProposalUsd)}
                </span>
              </div>
              <Slider
                value={[guardrails.maxPerProposalUsd]}
                min={25_000}
                max={200_000}
                step={25_000}
                disabled={confirmed}
                onValueChange={([value]) => update({ maxPerProposalUsd: value })}
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-700">Total budget cap</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatUsd(guardrails.totalBudgetUsd)}
                </span>
              </div>
              <Slider
                value={[guardrails.totalBudgetUsd]}
                min={50_000}
                max={200_000}
                step={25_000}
                disabled={confirmed}
                onValueChange={([value]) => update({ totalBudgetUsd: value })}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Notify before disbursing</div>
                <p className="text-xs text-gray-500">
                  Otherwise I disburse and report it afterwards.
                </p>
              </div>
              <Switch
                checked={guardrails.notifyBeforeDisbursing}
                disabled={confirmed}
                onCheckedChange={(checked) => update({ notifyBeforeDisbursing: checked })}
              />
            </div>
          </>
        )}
      </div>

      {confirmed ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-50 py-3 text-sm font-medium text-green-700">
          <Check className="h-4 w-4" />
          Policy active
        </div>
      ) : (
        <Button
          type="button"
          variant="default"
          className="mt-4 h-12 w-full text-base"
          onClick={actions.confirmGuardrails}
        >
          {isAiManaged ? 'Delegate to AI' : 'Save policy'}
        </Button>
      )}
    </div>
  );
};
