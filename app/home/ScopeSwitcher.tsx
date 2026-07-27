'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Wallet, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';
import type { HomeScope } from './useHomeScope';

interface ScopeControlProps {
  scope: HomeScope;
  onScopeChange: (scope: HomeScope) => void;
  /** Number of entries the viewer has a stake in, shown as a count on the control. */
  mineCount: number;
}

/**
 * Pattern A — the viewer's own avatar is the switch, sitting above the feed.
 * Pressing it reads as "show me this through my own eyes": the page doesn't
 * change, only whose entries fill it. Compact and fast, but a bare avatar is a
 * weak affordance, so it carries a ring, a count and a tooltip.
 */
export function ScopeLens({ scope, onScopeChange, mineCount }: ScopeControlProps) {
  const { user } = useUser();
  const isActive = scope === 'mine';

  return (
    <Tooltip
      content={isActive ? 'Showing only your funding' : 'Show only your funding'}
      position="bottom"
      wrapperClassName="flex items-center"
    >
      <button
        type="button"
        onClick={() => onScopeChange(isActive ? 'all' : 'mine')}
        aria-pressed={isActive}
        aria-label={isActive ? 'Show everything' : 'Show only your funding'}
        className={cn(
          'relative flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors',
          isActive ? 'bg-primary-600 pr-3 text-white' : 'hover:bg-gray-200/70'
        )}
      >
        <span
          className={cn(
            'flex rounded-full ring-2 transition-colors',
            isActive ? 'ring-white' : 'ring-transparent'
          )}
        >
          <Avatar
            src={user?.authorProfile?.profileImage}
            alt={user?.authorProfile?.fullName ?? user?.fullName ?? 'You'}
            size={28}
            disableTooltip
          />
        </span>
        {isActive ? (
          <span className="text-[13px] font-semibold">Yours</span>
        ) : (
          mineCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white ring-2 ring-gray-50">
              {mineCount}
            </span>
          )
        )}
      </button>
    </Tooltip>
  );
}

/**
 * Pattern C — the Airbnb "switch to hosting" move. This is a mode rather than a
 * filter: the caller swaps the page title, the chrome and the content behind
 * it, and the switch itself lives up in the identity corner rather than in the
 * content. Deliberately a two-step menu so it can't be flipped by accident.
 */
export function ScopeModeSwitch({ scope, onScopeChange, mineCount }: ScopeControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFunding = scope === 'mine';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modes: { id: HomeScope; label: string; description: string; icon: typeof Globe }[] = [
    {
      id: 'all',
      label: 'Browsing',
      description: 'Discover research to fund',
      icon: Globe,
    },
    {
      id: 'mine',
      label: 'Funding',
      description: `Manage your ${mineCount} open commitments`,
      icon: Wallet,
    },
  ];

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-2.5 text-[13px] font-semibold transition-colors',
          isFunding
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
        )}
      >
        {isFunding ? <Wallet size={14} /> : <Globe size={14} />}
        {isFunding ? 'Funding' : 'Browsing'}
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-100">
          {modes.map((mode) => {
            const isActive = scope === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  onScopeChange(mode.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                  <mode.icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-900">
                    Switch to {mode.label.toLowerCase()}
                  </span>
                  <span className="block text-xs text-gray-500">{mode.description}</span>
                </span>
                {isActive && <Check size={16} className="shrink-0 text-primary-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ScopeBannerProps {
  mineCount: number;
  onExit: () => void;
}

/**
 * The failure mode every scope filter shares is that people forget it's on and
 * then read a thin feed as "nothing is happening". Borrowing Stripe's test-mode
 * treatment: while scoped, say so persistently and keep the exit one click away.
 */
export function ScopeBanner({ mineCount, onExit }: ScopeBannerProps) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50/70 px-3 py-2">
      <Wallet size={15} className="shrink-0 text-primary-600" />
      <p className="min-w-0 flex-1 text-[13px] text-primary-900">
        Showing only what you fund —{' '}
        <span className="font-semibold">
          {mineCount} {mineCount === 1 ? 'commitment' : 'commitments'}
        </span>
      </p>
      <button
        type="button"
        onClick={onExit}
        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[13px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
      >
        <X size={13} />
        Show everything
      </button>
    </div>
  );
}
