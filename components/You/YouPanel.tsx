'use client';

import Link from 'next/link';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { SidePanel } from '@/components/ui/SidePanel';
import { useNotifications } from '@/contexts/NotificationContext';
import type { User } from '@/types/user';
import { formatBadgeCount } from '@/utils/number';
import { cn } from '@/utils/styles';
import { YouDraftsCard } from './YouDraftsCard';
import { YouFundingPowerCard } from './YouFundingPowerCard';
import { YouAccountCard, YouMoreCard } from './YouMoreCard';
import { YOU_CARD } from './youStyles';

interface YouPanelProps {
  readonly user: User;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function YouHeader({ onClose }: { readonly onClose: () => void }) {
  // The bell is the phone's way to notifications, so it carries the count.
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-1 bg-[#f1f3f6] px-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Back"
        className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-200/60"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>
      <h2 className="flex-1 text-[22px] font-bold tracking-[-0.02em] text-gray-900">You</h2>
      <Link
        href="/notifications"
        onClick={onClose}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative -mr-2.5 flex h-11 w-11 items-center justify-center rounded-[10px] text-gray-700 transition-colors hover:bg-gray-200/60"
      >
        <Bell size={21} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-medium leading-none text-white ring-2 ring-[#f1f3f6]"
          >
            {formatBadgeCount(unreadCount)}
          </span>
        )}
      </Link>
    </header>
  );
}

function YouProfileCard({
  user,
  onNavigate,
}: {
  readonly user: User;
  readonly onNavigate: () => void;
}) {
  const authorId = user.authorProfile?.id;
  const content = (
    <>
      <Avatar
        src={user.authorProfile?.profileImage}
        alt={user.authorProfile?.fullName ?? user.fullName}
        size={48}
        className="font-semibold"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-gray-900">Your profile</span>
        <span className="block text-[13px] text-gray-500">View and edit</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
    </>
  );
  const className = cn(YOU_CARD, 'flex items-center gap-3 p-3.5');

  if (!authorId) return <div className={className}>{content}</div>;
  return (
    <Link
      href={`/author/${authorId}`}
      onClick={onNavigate}
      className={cn(
        className,
        'outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500'
      )}
    >
      {content}
    </Link>
  );
}

/**
 * The phone's You screen (canvas NV-YouPage), opened from the avatar in the top
 * bar: your profile, funding power, drafts and My Funding, Endowment, help and
 * currency, then the account's places. It fills the screen and slides in from
 * the right; Back or a swipe right puts it away, and so does going anywhere
 * from it. Its content is only mounted while it is open.
 */
export function YouPanel({ user, isOpen, onClose }: YouPanelProps) {
  return (
    <SidePanel isOpen={isOpen} onClose={onClose}>
      <div className="min-h-full bg-[#f1f3f6] pb-safe">
        <YouHeader onClose={onClose} />
        <div className="flex flex-col gap-3 px-4 pb-6 pt-1">
          <YouProfileCard user={user} onNavigate={onClose} />
          <YouFundingPowerCard />
          <YouDraftsCard onNavigate={onClose} />
          <YouMoreCard onNavigate={onClose} />
          <YouAccountCard user={user} onNavigate={onClose} />
        </div>
      </div>
    </SidePanel>
  );
}
