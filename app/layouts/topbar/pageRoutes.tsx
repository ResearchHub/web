import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse as faHouseLight,
  faBookmark as faBookmarkLight,
} from '@fortawesome/pro-light-svg-icons';
import { Shield, Users, Activity, Settings } from 'lucide-react';
import { Icon } from '@/components/ui/icons';
import { HOME_TAB_PATHS, isHomeTabPath } from '@/hooks/useFundTabs';

export interface PageInfo {
  title: string;
  /** Stands in for the title where the bar has no room for it: phones and narrow tablets. */
  compactTitle?: string;
  icon?: React.ReactNode;
  /** The page names what it has open and has not yet: a placeholder stands in. */
  loading?: boolean;
}

export const ROOT_NAVIGATION_PATHS = new Set([
  ...HOME_TAB_PATHS,
  '/peer-review',
  '/journal',
  '/notebook',
  '/lists',
  '/settings',
  '/endowment',
  '/my-funding',
]);

export const isRootNavigationPage = (pathname: string): boolean =>
  ROOT_NAVIGATION_PATHS.has(pathname);

interface RouteRule {
  match: (pathname: string) => boolean;
  getInfo: (pathname: string, searchParams?: URLSearchParams) => PageInfo;
}

const ROUTE_RULES: RouteRule[] = [
  {
    match: (p) => isHomeTabPath(p),
    getInfo: () => ({
      title: 'Fund Scientific Research',
      icon: <FontAwesomeIcon icon={faHouseLight} fontSize={24} color="#000" />,
    }),
  },
  {
    match: (p) => p === '/my-funding',
    getInfo: () => ({
      title: 'My Funding',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    }),
  },
  {
    // Not a root navigation page, so the top bar gives it the back arrow:
    // that arrow is the way out of the workspace. It always names what it has
    // open (a document, or the draft it will start) rather than itself, so
    // until it does, the title is a placeholder rather than "Workspace".
    match: (p) => p === '/workspace',
    getInfo: () => ({ title: '', loading: true }),
  },
  {
    match: (p) => p === '/notifications',
    getInfo: () => ({
      title: 'Notifications',
      icon: <Icon name="notification" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/researchcoin',
    getInfo: () => ({
      title: 'My Wallet',
      icon: <Icon name="rscThin" size={28} />,
    }),
  },
  {
    match: (p) => p === '/lists' || p.startsWith('/list/'),
    getInfo: () => ({
      title: 'Your Lists',
      icon: <FontAwesomeIcon icon={faBookmarkLight} fontSize={24} color="#000" />,
    }),
  },
  {
    match: (p) => p.startsWith('/peer-review'),
    getInfo: () => ({
      title: 'Peer Review',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/journal'),
    getInfo: () => ({
      title: 'Journal',
      icon: <Icon name="rhJournal2" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/moderators'),
    getInfo: () => ({
      title: 'Moderation',
      icon: <Shield size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/expert-finder' || p.startsWith('/expert-finder/'),
    getInfo: () => ({
      title: 'Expert Finder',
      icon: <Users size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/activity',
    getInfo: () => ({
      title: 'Activity',
      icon: <Activity size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/settings' || p.startsWith('/settings/'),
    getInfo: () => ({
      title: 'Settings',
      icon: <Settings size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/endowment',
    getInfo: () => ({
      title: 'ResearchHub Endowment',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/rfp/'),
    getInfo: () => ({
      title: 'Request for Proposal',
      compactTitle: 'RFP',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/proposal'),
    getInfo: () => ({
      title: 'Proposal',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/report/'),
    getInfo: () => ({
      title: 'Registered Report',
      icon: <Icon name="rhJournal2" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/grants',
    getInfo: () => ({
      title: 'Awards',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/post/'),
    getInfo: () => ({
      title: 'Preprint',
      icon: <Icon name="preprint" size={20} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/author/'),
    getInfo: () => ({
      title: 'Profile',
      icon: <Icon name="profile" size={24} className="text-gray-900" />,
    }),
  },
];

export const getPageInfo = (pathname: string, searchParams?: URLSearchParams): PageInfo | null => {
  const rule = ROUTE_RULES.find((r) => r.match(pathname));
  return rule ? rule.getInfo(pathname, searchParams) : null;
};
