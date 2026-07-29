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
  /** Collapse the two sections into one larger unsectioned list (see HOME_VARIATIONS). */
  flat?: boolean;
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
  flat = false,
}: HomeSidebarProps) {
  const { user } = useUser();
  const profileHref = user?.authorProfile?.id ? `/author/${user.authorProfile.id}` : '/';

  const rows: Record<NavRowId, NavRowProps> = {
    home: {
      label: 'Home',
      isActive: activeItem === 'home',
      onClick: () => onSelect('home'),
      renderIcon: (color, isActive, iconSize) => (
        <FontAwesomeIcon
          icon={isActive ? faHouseSolid : faHouseLight}
          fontSize={iconSize - 4}
          color={color}
        />
      ),
    },
    funding: {
      label: 'Your Funding',
      isActive: activeItem === 'funding',
      onClick: () => onSelect('funding'),
      icons: ['fund', 'solidHand'],
      hasUpdates: fundingCount > 0,
    },
    notebook: {
      label: 'Notebook',
      href: '/notebook',
      icons: ['labNotebook2', 'notebookBold'],
    },
    earn: { label: 'Earn', href: '/earn', icons: ['earn1', 'solidEarn'] },
    journal: { label: 'Journal', href: '/journal', icons: ['rhJournal1', 'rhJournal2'] },
    endowment: {
      label: 'Endowment',
      href: '/endowment',
      renderIcon: (color, isActive, iconSize) => (
        <Sprout size={iconSize - 2} color={color} strokeWidth={isActive ? 2.25 : 2} />
      ),
    },
    lists: {
      label: 'Lists',
      href: '/lists',
      renderIcon: (color, isActive, iconSize) => (
        <FontAwesomeIcon
          icon={isActive ? faBookmarkSolid : faBookmarkLight}
          fontSize={iconSize - 4}
          color={color}
        />
      ),
    },
    profile: {
      label: 'Profile',
      href: profileHref,
      renderIcon: (color, isActive, iconSize) => (
        <FontAwesomeIcon
          icon={isActive ? faUserSolid : faUserLight}
          fontSize={iconSize - 4}
          color={color}
        />
      ),
    },
  };

  const rowSize = flat ? 'lg' : 'md';
  const renderRow = (id: NavRowId) => <NavRow key={id} {...rows[id]} size={rowSize} />;

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
        {flat ? (
          <div className={NAV_ROW_SIZES[rowSize].gap}>{FLAT_NAV_ORDER.map(renderRow)}</div>
        ) : (
          <>
            <div className="space-y-0.5">
              {(['home', 'journal', 'earn', 'endowment'] as const).map(renderRow)}
            </div>

            <div className="my-3 border-t border-gray-200" />

            <Link
              href={profileHref}
              className="flex w-full items-center rounded-lg px-3 py-1.5 text-[15px] font-semibold text-gray-900 hover:bg-gray-50 tablet:max-sidebar-compact:!hidden"
            >
              You
            </Link>

            <div className="mt-0.5 space-y-0.5">
              {(['funding', 'notebook', 'lists', 'profile'] as const).map(renderRow)}
            </div>
          </>
        )}
      </nav>

      <div className="tablet:max-sidebar-compact:!hidden">
        <FooterLinks />
      </div>
    </div>
  );
}

type NavRowId =
  | 'home'
  | 'funding'
  | 'notebook'
  | 'earn'
  | 'journal'
  | 'endowment'
  | 'lists'
  | 'profile';

/** The flat variation keeps only the six destinations people actually return to. */
const FLAT_NAV_ORDER = ['home', 'funding', 'notebook', 'earn', 'journal', 'endowment'] as const;

const NAV_ROW_SIZES = {
  md: { icon: 22, text: 'text-[14px]', padding: 'py-2', gutter: 'mr-3', gap: 'space-y-0.5' },
  lg: { icon: 26, text: 'text-[15px]', padding: 'py-2.5', gutter: 'mr-3.5', gap: 'space-y-2' },
} as const;

interface NavRowProps {
  label: string;
  /** Links leave the demo; buttons switch the hub's own destination. */
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  /** Light and solid variants of the shared icon, in that order. */
  icons?: [IconName, IconName];
  /** Escape hatch for icons that don't come from the shared set. */
  renderIcon?: (color: string, isActive: boolean, iconSize: number) => React.ReactNode;
  /** Unread marker: a dot, not a count — the number isn't the point here. */
  hasUpdates?: boolean;
  size?: keyof typeof NAV_ROW_SIZES;
}

function NavRow({
  label,
  href,
  onClick,
  isActive = false,
  icons,
  renderIcon,
  hasUpdates,
  size = 'md',
}: NavRowProps) {
  const iconColor = isActive ? '#3971ff' : '#404040';
  const scale = NAV_ROW_SIZES[size];

  const content = (
    <>
      <span
        className={cn(
          'flex flex-shrink-0 items-center justify-center tablet:max-sidebar-compact:!mr-0',
          scale.gutter
        )}
        style={{ height: scale.icon, width: scale.icon }}
      >
        {renderIcon ? (
          renderIcon(iconColor, isActive, scale.icon)
        ) : icons ? (
          <Icon name={isActive ? icons[1] : icons[0]} size={scale.icon} color={iconColor} />
        ) : null}
      </span>
      <span className="flex w-full min-w-0 items-center gap-2 tablet:max-sidebar-compact:!hidden">
        <span className={cn('truncate', scale.text, isActive ? 'font-semibold' : 'font-medium')}>
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
    'flex w-full items-center rounded-lg px-3 transition-colors',
    scale.padding,
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
