'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBookmark as faBookmarkSolid,
  faSackDollar as faSackDollarSolid,
  faUser as faUserSolid,
} from '@fortawesome/pro-solid-svg-icons';
import {
  faBookmark as faBookmarkLight,
  faSackDollar as faSackDollarLight,
  faUser as faUserLight,
} from '@fortawesome/pro-light-svg-icons';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

interface YouSectionProps {
  forceMinimize?: boolean;
}

interface YouItem {
  label: string;
  href: string;
  /** Light and solid FontAwesome variants, in that order. */
  faIcons?: [IconDefinition, IconDefinition];
  /** Light and solid variants from the shared icon set, in that order. */
  icons?: [IconName, IconName];
  isActive: (currentPath: string) => boolean;
}

const ACTIVE_ICON_COLOR = '#3971ff';
const INACTIVE_ICON_COLOR = '#404040';

/**
 * The viewer's own corner of the left nav: the places that only exist because
 * they are theirs. Kept separate from the product destinations above it so
 * "mine" never has to be expressed as a filter on a shared surface.
 */
export const YouSection: React.FC<YouSectionProps> = ({ forceMinimize = false }) => {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { user } = useUser();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const authorId = user?.authorProfile?.id;
  // Signed-out clicks open the auth modal, so the href only has to resolve once
  // we know who the viewer is.
  const profileHref = authorId ? `/author/${authorId}` : '/';

  const items: YouItem[] = [
    {
      label: 'Your Funding',
      href: '/fund/dashboard',
      faIcons: [faSackDollarLight, faSackDollarSolid],
      isActive: (path) => path.startsWith('/fund/dashboard'),
    },
    {
      label: 'Notebook',
      href: '/notebook',
      icons: ['labNotebook2', 'notebookBold'],
      isActive: (path) => path.startsWith('/notebook'),
    },
    {
      label: 'Lists',
      href: '/lists',
      faIcons: [faBookmarkLight, faBookmarkSolid],
      isActive: (path) => path === '/lists' || path.startsWith('/list/'),
    },
    {
      label: 'Profile',
      href: profileHref,
      faIcons: [faUserLight, faUserSolid],
      isActive: (path) => (authorId ? path.startsWith(`/author/${authorId}`) : false),
    },
  ];

  const handleClick = (href: string) => (event: React.MouseEvent) => {
    if (user) return;
    event.preventDefault();
    executeAuthenticatedAction(() => router.push(href));
  };

  return (
    <div className="mt-2">
      <div
        className={cn(
          'mb-2 border-t border-gray-200',
          forceMinimize ? 'mx-1' : 'mx-1 tablet:max-sidebar-compact:!mx-0'
        )}
      />

      <Link
        href={profileHref}
        onClick={handleClick(profileHref)}
        className={cn(
          'flex w-full items-center rounded-lg px-5 py-2.5 text-[17px] font-semibold text-gray-900 hover:bg-gray-50',
          forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'
        )}
      >
        You
      </Link>

      <div className="space-y-1.5">
        {items.map((item) => {
          const isActive = item.isActive(pathname);
          const iconColor = isActive ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleClick(item.href)}
              scroll={false}
              title={item.label}
              className={cn(
                'flex w-full items-center rounded-lg px-5 py-3.5 text-[15px] font-medium',
                forceMinimize
                  ? '!justify-center !px-2'
                  : 'tablet:max-sidebar-compact:!justify-center tablet:max-sidebar-compact:!px-2',
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span
                className={cn(
                  'flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center',
                  forceMinimize ? 'mr-0' : 'mr-4 tablet:max-sidebar-compact:!mr-0'
                )}
              >
                {item.faIcons ? (
                  <FontAwesomeIcon
                    icon={isActive ? item.faIcons[1] : item.faIcons[0]}
                    fontSize={20}
                    color={iconColor}
                  />
                ) : item.icons ? (
                  <Icon
                    name={isActive ? item.icons[1] : item.icons[0]}
                    size={26}
                    color={iconColor}
                  />
                ) : null}
              </span>
              <span
                className={cn(
                  'w-full min-w-0',
                  forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'
                )}
              >
                <span className="truncate text-[16px] font-semibold">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
