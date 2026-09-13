'use client';

import { FC, useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Shield } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/utils/styles';

const INCLUDE_PRIVATE_PARAM = 'include_private';

function isIncludePrivateParam(value: string | null): boolean {
  return value === 'true' || value === '1';
}

interface IncludePrivateProposalsControlProps {
  className?: string;
  locked?: boolean;
}

/**
 * Moderator / hub-editor control that appends `include_private=true` so the
 * funding discovery feed includes private proposals. Off by default on
 * discovery; locked on for grant-scoped lists.
 */
export const IncludePrivateProposalsControl: FC<IncludePrivateProposalsControlProps> = ({
  className,
  locked = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const urlActive = isIncludePrivateParam(searchParams.get(INCLUDE_PRIVATE_PARAM));
  const includePrivate = locked || urlActive;

  const setIncludePrivate = useCallback(
    (enabled: boolean) => {
      if (locked) return;
      const params = new URLSearchParams(searchParams.toString());
      if (enabled) {
        params.set(INCLUDE_PRIVATE_PARAM, 'true');
      } else {
        params.delete(INCLUDE_PRIVATE_PARAM);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [locked, pathname, router, searchParams]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Private proposal options"
          aria-label="Private proposal options"
          className={cn(
            'rounded-md p-2 transition-colors',
            includePrivate
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
      </PopoverContent>
    </Popover>
  );
};
