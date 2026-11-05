'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  LogOut,
  Megaphone,
  Search,
  Settings,
  Shield,
  Sprout,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { LEGAL_LINKS, RESOURCE_LINKS, SOCIAL_LINKS } from '@/app/layouts/components/helpLinks';
import { useChangelogSeen } from '@/components/changelog/useChangelogSeen';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useVerification } from '@/contexts/VerificationContext';
import { AuthSharingService } from '@/services/auth-sharing.service';
import type { User } from '@/types/user';
import { cn } from '@/utils/styles';
import { CurrencySwitch } from './CurrencySwitch';
import { YOU_CARD, YOU_ROW } from './youStyles';

const MENU_ROW =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 outline-none transition-colors data-[highlighted]:bg-gray-50';

const ICON = 'shrink-0 text-gray-600';

function Chevron() {
  return <ChevronRight size={16} className="shrink-0 text-gray-400" aria-hidden="true" />;
}

function NewBadge({ className }: { readonly className: string }) {
  return (
    <span className={cn('rounded-full px-[7px] py-px text-[11px] font-semibold', className)}>
      New
    </span>
  );
}

function RowLink({
  href,
  icon,
  onNavigate,
  trailing,
  children,
}: {
  readonly href: string;
  readonly icon: ReactNode;
  readonly onNavigate: () => void;
  readonly trailing?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <Link href={href} onClick={onNavigate} className={YOU_ROW}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
      <Chevron />
    </Link>
  );
}

function lucide(Icon: LucideIcon, className = ICON) {
  return <Icon size={19} className={className} aria-hidden="true" />;
}

/** "Help & resources": the same links as the sidebar's menu, in a menu off the row. */
function HelpRow({ onNavigate }: { readonly onNavigate: () => void }) {
  const { hasSeen, markSeen } = useChangelogSeen();

  return (
    <BaseMenu
      align="end"
      sideOffset={6}
      className="w-60 rounded-xl p-1.5 shadow-lg"
      trigger={
        <button type="button" className={cn(YOU_ROW, 'data-[state=open]:bg-gray-50')}>
          {lucide(CircleHelp)}
          <span className="min-w-0 flex-1 truncate">Help &amp; resources</span>
          {!hasSeen && <NewBadge className="bg-orange-50 text-orange-700" />}
          <Chevron />
        </button>
      }
    >
      <DropdownMenu.Item
        asChild
        onSelect={() => {
          markSeen();
          onNavigate();
        }}
      >
        <Link href="/changelog" className={MENU_ROW}>
          <Megaphone className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
          <span className="flex-1">What’s new</span>
          {!hasSeen && (
            <span className="rounded-full bg-orange-50 px-1.5 text-[11px] font-semibold text-orange-700">
              New
            </span>
          )}
        </Link>
      </DropdownMenu.Item>
      {RESOURCE_LINKS.map(({ label, href, icon: Icon }) => (
        <DropdownMenu.Item key={label} asChild>
          <a href={href} target="_blank" rel="noopener noreferrer" className={MENU_ROW}>
            <Icon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
          </a>
        </DropdownMenu.Item>
      ))}

      <DropdownMenu.Separator className="mx-1 my-1.5 h-px bg-gray-100" />

      <div className="flex items-center px-0.5">
        {SOCIAL_LINKS.map(({ label, href, icon }) => (
          <DropdownMenu.Item key={label} asChild>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 outline-none transition-colors data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-800"
            >
              <FontAwesomeIcon icon={icon} className="h-[15px] w-[15px]" />
            </a>
          </DropdownMenu.Item>
        ))}
        <span className="flex-1" />
        <span className="flex items-center gap-1 pr-1.5 text-xs text-gray-500">
          {LEGAL_LINKS.map(({ label, href }, index) => (
            <span key={label} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">·</span>}
              <DropdownMenu.Item asChild>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer rounded outline-none hover:text-gray-800 data-[highlighted]:text-gray-800 data-[highlighted]:underline"
                >
                  {label}
                </a>
              </DropdownMenu.Item>
            </span>
          ))}
        </span>
      </div>
    </BaseMenu>
  );
}

/** Endowment, help and the currency. */
export function YouMoreCard({ onNavigate }: { readonly onNavigate: () => void }) {
  return (
    <section aria-label="More" className={cn(YOU_CARD, 'overflow-hidden')}>
      <RowLink
        href="/endowment"
        icon={lucide(Sprout, 'shrink-0 text-green-600')}
        onNavigate={onNavigate}
      >
        Endowment
      </RowLink>
      <HelpRow onNavigate={onNavigate} />
      <div className={cn(YOU_ROW, 'hover:bg-white')}>
        {lucide(CircleDollarSign)}
        <span className="min-w-0 flex-1 truncate">Currency</span>
        <CurrencySwitch />
      </div>
    </section>
  );
}

/**
 * The rest of what the avatar's menu held: the wallet, the role-gated tools,
 * lists, settings, verification, referrals and signing out. Notifications are
 * the header's bell, the profile is the card at the top.
 */
export function YouAccountCard({
  user,
  onNavigate,
}: {
  readonly user: User;
  readonly onNavigate: () => void;
}) {
  const { openVerificationModal } = useVerification();
  const isModerator = !!user.isModerator;
  const canFindExperts = isModerator || !!user.authorProfile?.isHubEditor;

  return (
    <section aria-label="Account" className={cn(YOU_CARD, 'overflow-hidden')}>
      <RowLink
        href="/researchcoin"
        icon={<ResearchCoinIcon outlined className="h-[19px] w-[19px] shrink-0" color="#4b5563" />}
        onNavigate={onNavigate}
      >
        My ResearchCoin
      </RowLink>
      {isModerator && (
        <RowLink href="/moderators" icon={lucide(Shield)} onNavigate={onNavigate}>
          Moderation
        </RowLink>
      )}
      {canFindExperts && (
        <RowLink href="/expert-finder" icon={lucide(Search)} onNavigate={onNavigate}>
          Expert Finder
        </RowLink>
      )}
      <RowLink href="/lists" icon={lucide(Bookmark)} onNavigate={onNavigate}>
        Your Lists
      </RowLink>
      <RowLink href="/settings" icon={lucide(Settings)} onNavigate={onNavigate}>
        Settings
      </RowLink>
      {!user.isVerified && (
        <button
          type="button"
          onClick={() => {
            onNavigate();
            openVerificationModal();
          }}
          className={YOU_ROW}
        >
          {lucide(BadgeCheck)}
          <span className="min-w-0 flex-1 truncate">Verify account</span>
          <Chevron />
        </button>
      )}
      <RowLink
        href="/referral"
        icon={lucide(UserPlus)}
        onNavigate={onNavigate}
        trailing={<NewBadge className="bg-blue-100 text-blue-600" />}
      >
        Refer and earn 10%
      </RowLink>
      <button
        type="button"
        onClick={() => AuthSharingService.signOutFromBothApps()}
        className={YOU_ROW}
        data-testid="user-menu-signout"
      >
        {lucide(LogOut)}
        <span className="min-w-0 flex-1 truncate">Sign out</span>
      </button>
    </section>
  );
}
