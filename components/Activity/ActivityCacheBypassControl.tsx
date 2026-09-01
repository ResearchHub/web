'use client';

import { FC, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Popover from '@radix-ui/react-popover';
import { Shield } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/utils/styles';

const DISABLE_CACHE_PARAM = 'disable_cache';

function isDisableCacheParam(value: string | null): boolean {
  return value === 'true' || value === '1';
}

interface ActivityCacheBypassControlProps {
  className?: string;
}

/**
 * Moderator / hub-editor control that appends `disable_cache=true` to the URL
 * so the homepage Activity feed skips the warm public cache. Off by default.
 */
export const ActivityCacheBypassControl: FC<ActivityCacheBypassControlProps> = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const bypassActive = isDisableCacheParam(searchParams.get(DISABLE_CACHE_PARAM));

  const setBypass = useCallback(
    (enabled: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (enabled) {
        params.set(DISABLE_CACHE_PARAM, 'true');
      } else {
        params.delete(DISABLE_CACHE_PARAM);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/', { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          title="Feed cache options"
          aria-label="Feed cache options"
          className={cn(
            'rounded-md p-2 transition-colors',
            bypassActive
              ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            className
          )}
        >
          <Shield className="h-[18px] w-[18px]" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-[100000] w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Bypass cache</p>
            </div>
            <Switch checked={bypassActive} onCheckedChange={setBypass} className="shrink-0" />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
