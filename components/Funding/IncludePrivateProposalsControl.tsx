'use client';

import { FC, useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Shield } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/utils/styles';

const INCLUDE_PRIVATE_PARAM = 'include_private';
/** Reveals the Foundation RFPs that /fund hides for being under the funding minimum. */
export const SHOW_ALL_RFPS_PARAM = 'show_all_rfps';

export function isTrueParam(value: string | null): boolean {
  return value === 'true' || value === '1';
}

interface IncludePrivateProposalsControlProps {
  className?: string;
  locked?: boolean;
  /** Adds the "Show all RFPs" switch, for the RFPs tab. */
  showAllRfpsToggle?: boolean;
}

/**
 * Moderator / hub-editor control that appends `include_private=true` so the
 * funding discovery feed includes private proposals. Off by default on
 * discovery; locked on for grant-scoped lists.
 */
export const IncludePrivateProposalsControl: FC<IncludePrivateProposalsControlProps> = ({
  className,
  locked = false,
  showAllRfpsToggle = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const urlActive = isTrueParam(searchParams.get(INCLUDE_PRIVATE_PARAM));
  const includePrivate = locked || urlActive;
  const showAllRfps = showAllRfpsToggle && isTrueParam(searchParams.get(SHOW_ALL_RFPS_PARAM));

  const setParam = useCallback(
    (name: string, enabled: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (enabled) {
        params.set(name, 'true');
      } else {
        params.delete(name);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setIncludePrivate = useCallback(
    (enabled: boolean) => {
      if (locked) return;
      setParam(INCLUDE_PRIVATE_PARAM, enabled);
    },
    [locked, setParam]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Admin feed options"
          aria-label="Admin feed options"
          className={cn(
            'rounded-md p-2 transition-colors',
            includePrivate || showAllRfps
              ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            className
          )}
        >
          <Shield className="h-[18px] w-[18px]" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-64">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Show private proposals</p>
          </div>
          <Switch
            checked={includePrivate}
            onCheckedChange={setIncludePrivate}
            disabled={locked}
            className="shrink-0"
          />
        </div>
        {showAllRfpsToggle && (
          <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Show all RFPs</p>
              <p className="text-xs text-gray-500">Include Foundation RFPs under $1K</p>
            </div>
            <Switch
              checked={showAllRfps}
              onCheckedChange={(enabled) => setParam(SHOW_ALL_RFPS_PARAM, enabled)}
              className="shrink-0"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
