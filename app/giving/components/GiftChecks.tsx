import { Check } from 'lucide-react';
import { cn } from '@/utils/styles';

/** What every gift gets. The hero and the gift popup show the same three. */
export const GIFT_CHECKS = [
  'Matched 1:1 before 2027',
  'Tax-deductible',
  'Goes to the research you choose',
] as const;

export function GiftChecks({ size = 'md', className }: { size?: 'sm' | 'md'; className?: string }) {
  const small = size === 'sm';
  return (
    <ul className={cn('flex flex-col', small ? 'gap-2.5' : 'gap-3.5', className)}>
      {GIFT_CHECKS.map((label) => (
        <li
          key={label}
          className={cn(
            'flex items-center gap-3 font-semibold text-[#1f2937]',
            small ? 'text-[15px]' : 'text-base'
          )}
        >
          <span
            className={cn(
              'flex flex-none items-center justify-center rounded-full bg-[#3971ff] text-white',
              small ? 'h-5 w-5' : 'h-6 w-6'
            )}
            aria-hidden
          >
            <Check className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={3.2} />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
