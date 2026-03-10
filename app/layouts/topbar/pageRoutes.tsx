import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse as faHouseLight,
  faBookmark as faBookmarkLight,
  faCommentsQuestion,
  faGrid3 as faGrid3Light,
  faMagnifyingGlass,
} from '@fortawesome/pro-light-svg-icons';
import { ChartNoAxesColumnIncreasing, Shield, Hash } from 'lucide-react';
import Image from 'next/image';
import { Icon } from '@/components/ui/icons';
import { getTopicEmoji } from '@/components/Topic/TopicEmojis';
import { toTitleCase } from '@/utils/stringUtils';
import { getSourceLogo, getPreprintDisplayName } from '@/utils/preprintUtil';

export interface PageInfo {
  title: string;
  icon?: React.ReactNode;
  breadcrumbParent?: { title: string; href: string };
}

export const ROOT_NAVIGATION_PATHS = new Set([
  '/',
  '/following',
  '/latest',
  '/popular',
  '/for-you',
  '/feed',
  '/earn',
  '/fund',
  '/dashboard',
  '/dashboard/impact',
  '/journal',
  '/notebook',
  '/browse',
  '/leaderboard',
  '/lists',
]);

export const isRootNavigationPage = (pathname: string): boolean =>
  ROOT_NAVIGATION_PATHS.has(pathname);

interface RouteRule {
  match: (pathname: string) => boolean;
  getInfo: (pathname: string, searchParams?: URLSearchParams) => PageInfo;
}

const ROUTE_RULES: RouteRule[] = [
  {
    match: (p) => ['/', '/following', '/latest', '/popular', '/for-you', '/feed'].includes(p),
    getInfo: () => ({
      title: 'Home',
      icon: <FontAwesomeIcon icon={faHouseLight} fontSize={24} color="#000" />,
    }),
  },
  {
    match: (p) => p === '/browse',
    getInfo: () => ({
      title: 'Browse',
      icon: <FontAwesomeIcon icon={faGrid3Light} fontSize={24} color="#000" />,
    }),
  },
  {
    match: (p) => p === '/search',
    getInfo: () => ({
      title: 'Search',
      icon: <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={24} color="#000" />,
    }),
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
    match: (p) => p.startsWith('/paper/create'),
    getInfo: () => ({
      title: 'Submit your paper',
      icon: <Icon name="submit2" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/bounty/create'),
    getInfo: () => ({
      title: 'Create Bounty',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/earn'),
    getInfo: (_p, searchParams) => {
      const earnTab = searchParams?.get('tab') || 'awards';
      return {
        title: earnTab === 'reviews' ? 'Peer Reviews' : 'Funding Opportunities',
        icon: <Icon name="earn1" size={24} className="text-gray-900" />,
        breadcrumbParent: { title: 'Earn', href: '/earn' },
      };
    },
  },
  {
    match: (p) => p.startsWith('/journal'),
    getInfo: () => ({
      title: 'Journal',
      icon: <Icon name="rhJournal2" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/leaderboard'),
    getInfo: () => ({
      title: 'Leaderboard',
      icon: <ChartNoAxesColumnIncreasing size={24} color="#404040" strokeWidth={2} />,
    }),
  },
  {
    match: (p) => p.startsWith('/moderators'),
    getInfo: () => ({
      title: 'Moderation Dashboard',
      icon: <Shield size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/dashboard'),
    getInfo: () => ({
      title: 'My Dashboard',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p === '/fund' || p.startsWith('/grant/'),
    getInfo: () => ({
      title: 'Funding Marketplace',
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
    match: (p) => p === '/grants',
    getInfo: () => ({
      title: 'Awards',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
      breadcrumbParent: { title: 'Earn', href: '/earn' },
    }),
  },
  {
    match: (p) => p.startsWith('/paper/'),
    getInfo: () => ({
      title: 'Paper',
      icon: <Icon name="workType" size={20} className="text-gray-900" />,
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
    match: (p) => p.startsWith('/question/'),
    getInfo: () => ({
      title: 'Question',
      icon: <FontAwesomeIcon icon={faCommentsQuestion} fontSize={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/author/'),
    getInfo: () => ({
      title: 'Profile',
      icon: <Icon name="profile" size={24} className="text-gray-900" />,
    }),
  },
  {
    match: (p) => p.startsWith('/topic/'),
    getInfo: (pathname) => {
      const topicSlug = pathname.split('/topic/')[1]?.split('/')[0];
      if (!topicSlug) return { title: '' };

      const preprintLogo = getSourceLogo(topicSlug);
      if (preprintLogo && preprintLogo !== 'rhJournal2') {
        return {
          title: '',
          icon: (
            <Image
              src={preprintLogo}
              alt={getPreprintDisplayName(topicSlug)}
              width={80}
              height={24}
              className="object-contain"
              style={{ maxHeight: '24px' }}
            />
          ),
        };
      }

      const emoji = getTopicEmoji(topicSlug);
      const topicName = toTitleCase(topicSlug.replace(/-/g, ' '));

      return {
        title: topicName,
        icon: emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : (
          <Hash className="w-6 h-6 text-gray-400" />
        ),
      };
    },
  },
];

export const getPageInfo = (pathname: string, searchParams?: URLSearchParams): PageInfo | null => {
  const rule = ROUTE_RULES.find((r) => r.match(pathname));
  return rule ? rule.getInfo(pathname, searchParams) : null;
};
