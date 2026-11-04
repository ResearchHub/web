import { useFormContext } from 'react-hook-form';
import { Gauge, Trophy, type LucideIcon } from 'lucide-react';
import type { FundingMechanism } from '@/types/grant';
import { cn } from '@/utils/styles';
import type { SectionProps } from './SectionProps';
import type { PublishingFormData } from '../schema';

/** What the setting decides; shared with the workspace's publish dialog. */
export const GRANT_FUNDING_MECHANISM_HELP =
  'Both take proposals. Funding pays before the work; an award pays for results.';

const OPTIONS: {
  value: FundingMechanism;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: 'FUNDING',
    label: 'Funding',
    description: 'Proposals raise money before the work, with a funding bar.',
    icon: Gauge,
  },
  {
    value: 'AWARD',
    label: 'Award',
    description: 'Proposals compete for the award, paid once results are posted.',
    icon: Trophy,
  },
];

/**
 * Funding or Award, chosen once when an RFP is opened. A published RFP shows
 * the choice and does not send it again.
 */
export function GrantFundingMechanismSection({ className }: SectionProps) {
  const { watch, setValue } = useFormContext<PublishingFormData>();
  const value = watch('fundingMechanism') ?? 'FUNDING';
  const locked = Boolean(watch('workId'));

  return (
    <div className={cn('px-6 py-3', className)}>
      <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">Type</h3>
      <p className="mb-2 text-sm text-gray-500">{GRANT_FUNDING_MECHANISM_HELP}</p>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={locked}
              onClick={() =>
                setValue('fundingMechanism', option.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={cn(
                'flex flex-col rounded-xl border p-3 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40',
                selected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
                locked && 'cursor-default hover:border-gray-200'
              )}
            >
              <span className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    selected ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
                  )}
                >
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </span>
              <span className="mt-3 block text-sm font-semibold text-gray-900">{option.label}</span>
              <span className="mt-0.5 block text-xs font-normal leading-snug text-gray-500">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      {locked && <p className="mt-2 text-xs text-gray-500">Chosen when this RFP was opened.</p>}
    </div>
  );
}
