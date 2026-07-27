'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark as faBookmarkSolid,
  faHouse as faHouseSolid,
  faUser as faUserSolid,
} from '@fortawesome/pro-solid-svg-icons';
import {
  faBookmark as faBookmarkLight,
  faHouse as faHouseLight,
  faUser as faUserLight,
} from '@fortawesome/pro-light-svg-icons';
import { Sprout } from 'lucide-react';
import { FooterLinks } from '@/components/FooterLinks';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import { Logo } from '@/components/ui/Logo';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';
import { NewMenu } from './NewMenu';

/** The two destinations the hub owns; everything else leaves the page. */
export type HomeNavItem = 'home' | 'funding';

interface HomeSidebarProps {
  activeItem: HomeNavItem;
  onSelect: (item: HomeNavItem) => void;
  /** Open commitments. Only whether there are any shows in the nav. */
  fundingCount: number;
  /** Carry the create action here instead of the top bar (see HOME_VARIATIONS). */
  showPostButton?: boolean;
}

/**
 * The hub's own left nav. It replaces the app navigation so the demo can put
 * "Your Funding" alongside the product destinations rather than inside the
 * page — the second section is the viewer's own workspace, which is what makes
 * the nav a candidate home for the scope switch.
 */
export function HomeSidebar({
  activeItem,
  onSelect,
  fundingCount,
  showPostButton = false,
}: HomeSidebarProps) {
  const { user } = useUser();
  const profileHref = user?.authorProfile?.id ? `/author/${user.authorProfile.id}` : '/';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex p-4 pt-[10px] tablet:max-sidebar-compact:!justify-center">
        <Link href="/" aria-label="ResearchHub">
          <span className="ml-1 block tablet:max-sidebar-compact:!hidden">
            <Logo size={38} color="text-primary-600" />
          </span>
          <span className="hidden tablet:max-sidebar-compact:!block">
            <Icon name="flaskFrame" size={38} color="#3971ff" />
          </span>
        </Link>
      </div>

      {showPostButton && (
        <div className="mt-6 px-3 tablet:max-sidebar-compact:!flex tablet:max-sidebar-compact:!justify-center tablet:max-sidebar-compact:!px-2">
          <NewMenu variant="sidebar" />
        </div>
      )}

      <nav
        className={cn(
          'flex-1 overflow-y-auto px-3 tablet:max-sidebar-compact:!px-2',
          showPostButton ? 'pt-6' : 'pt-4'
        )}
      >
        <div className="space-y-0.5">
          <NavRow
            label="Home"
            isActive={activeItem === 'home'}
            onClick={() => onSelect('home')}
            renderIcon={(color, isActive) => (
              <FontAwesomeIcon
                icon={isActive ? faHouseSolid : faHouseLight}
                fontSize={18}
                color={color}
              />
            )}
          />
          <NavRow label="Journal" href="/journal" icons={['rhJournal1', 'rhJournal2']} />
          <NavRow label="Earn" href="/earn" icons={['earn1', 'solidEarn']} />
          <NavRow
            label="Endowment"
            href="/endowment"
            renderIcon={(color, isActive) => (
              <Sprout size={20} color={color} strokeWidth={isActive ? 2.25 : 2} />
            )}
          />
        </div>

        <div className="my-3 border-t border-gray-200" />

        <Link
          href={profileHref}
          className="flex w-full items-center rounded-lg px-3 py-1.5 text-[15px] font-semibold text-gray-900 hover:bg-gray-50 tablet:max-sidebar-compact:!hidden"
        >
          You
        </Link>

        <div className="mt-0.5 space-y-0.5">
          <NavRow
            label="Your Funding"
            isActive={activeItem === 'funding'}
            onClick={() => onSelect('funding')}
            icons={['fund', 'solidHand']}
            hasUpdates={fundingCount > 0}
          />
          <NavRow label="Notebook" href="/notebook" icons={['labNotebook2', 'notebookBold']} />
          <NavRow
            label="Lists"
            href="/lists"
            renderIcon={(color, isActive) => (
              <FontAwesomeIcon
                icon={isActive ? faBookmarkSolid : faBookmarkLight}
                fontSize={18}
                color={color}
              />
            )}
          />
          <NavRow
            label="Profile"
            href={profileHref}
            renderIcon={(color, isActive) => (
              <FontAwesomeIcon
                icon={isActive ? faUserSolid : faUserLight}
                fontSize={18}
                color={color}
              />
            )}
          />
        </div>
      </nav>

      <div className="tablet:max-sidebar-compact:!hidden">
        <FooterLinks />
      </div>
    </div>
  );
}

interface NavRowProps {
  label: string;
  /** Links leave the demo; buttons switch the hub's own destination. */
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  /** Light and solid variants of the shared icon, in that order. */
  icons?: [IconName, IconName];
  /** Escape hatch for icons that don't come from the shared set. */
  renderIcon?: (color: string, isActive: boolean) => React.ReactNode;
  /** Unread marker: a dot, not a count — the number isn't the point here. */
  hasUpdates?: boolean;
}

function NavRow({
  label,
  href,
  onClick,
  isActive = false,
  icons,
  renderIcon,
  hasUpdates,
}: NavRowProps) {
  const iconColor = isActive ? '#3971ff' : '#404040';

  const content = (
    <>
      <span className="mr-3 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center tablet:max-sidebar-compact:!mr-0">
        {renderIcon ? (
          renderIcon(iconColor, isActive)
        ) : icons ? (
          <Icon name={isActive ? icons[1] : icons[0]} size={22} color={iconColor} />
        ) : null}
      </span>
      <span className="flex w-full min-w-0 items-center gap-2 tablet:max-sidebar-compact:!hidden">
        <span className={cn('truncate text-[14px]', isActive ? 'font-semibold' : 'font-medium')}>
          {label}
        </span>
        {hasUpdates && (
          <span
            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
            aria-label="Has updates"
          />
        )}
      </span>
    </>
  );

  const className = cn(
    'flex w-full items-center rounded-lg px-3 py-2 transition-colors',
    'tablet:max-sidebar-compact:!justify-center tablet:max-sidebar-compact:!px-2',
    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
  );

  if (href) {
    return (
      <Link href={href} className={className} scroll={false}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      {content}
    </button>
  );
}
