'use client';

import { FC, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Popover from '@radix-ui/react-popover';
import { Shield, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import {
  SearchableUserSingleSelect,
  UserOption,
} from '@/components/ui/form/SearchableUserSingleSelect';
import { cn } from '@/utils/styles';

interface ModeratorViewAsFunderProps {
  className?: string;
}

/**
 * Moderator-only override that points the funding dashboard at another funder,
 * kept to a shield icon until it is in use. The active state comes from the
 * `user_id` param rather than local state so a reload or a shared link still
 * shows that the dashboard belongs to someone else.
 */
export const ModeratorViewAsFunder: FC<ModeratorViewAsFunderProps> = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<UserOption | null>(null);

  const userIdParam = searchParams.get('user_id');
  // The name is only known for a funder picked in this session; otherwise the
  // id is all we have to show.
  const label = selected?.value === userIdParam ? selected.label : `#${userIdParam}`;

  const applyUserId = useCallback(
    (option: UserOption | null) => {
      setSelected(option);
      const params = new URLSearchParams(searchParams.toString());
      if (option) {
        params.set('user_id', option.value);
      } else {
        params.delete('user_id');
      }
      router.push(`?${params.toString()}`);
      setIsOpen(false);
    },
    [router, searchParams]
  );

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      {userIdParam ? (
        // Two sibling buttons rather than a nested one: the chip as a whole
        // reopens the picker, the X exits the override.
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full bg-primary-50 py-1 pl-2 pr-1 text-primary-700',
            className
          )}
        >
          <Popover.Trigger asChild>
            <button type="button" className="inline-flex items-center gap-1.5 text-sm">
              <Shield className="h-4 w-4 flex-shrink-0" />
              {selected?.value === userIdParam && (
                <Avatar src={selected.avatarUrl} alt={selected.label} size="xs" disableTooltip />
              )}
              <span className="max-w-[140px] truncate font-medium">{label}</span>
            </button>
          </Popover.Trigger>
          <button
            type="button"
            onClick={() => applyUserId(null)}
            aria-label="Stop viewing as another funder"
            className="rounded-full p-0.5 transition-colors hover:bg-primary-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <Popover.Trigger asChild>
          <button
            type="button"
            title="View as funder (moderator)"
            aria-label="View as funder (moderator)"
            className={cn(
              'rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700',
              className
            )}
          >
            <Shield className="h-[18px] w-[18px]" />
          </button>
        </Popover.Trigger>
      )}

      <Popover.Portal>
        {/* No overflow clipping: the combobox renders its results absolutely
            positioned inside this panel. */}
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-[100000] w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
        >
          <p className="mb-2 text-xs font-medium text-gray-500">View dashboard as another funder</p>
          <SearchableUserSingleSelect
            value={selected}
            onChange={applyUserId}
            placeholder="Search for a funder..."
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
