import { AuthorProfile } from '@/types/authorProfile';

export interface AuthorSuggestion extends AuthorProfile {
  hIndex: number;
  worksCount: number;
  institution: string;
  suggestionReason: string;
  followersCount: number;
}

export const authors: AuthorSuggestion[] = [
  {
    id: 1,
    fullName: 'Dr. Sophia Martinez',
    firstName: 'Sophia',
    lastName: 'Martinez',
    profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    headline: 'Neuroscientist at MIT',
    profileUrl: '/profile/1',
    isClaimed: true,
    hIndex: 42,
    worksCount: 120,
    institution: 'MIT',
    suggestionReason: 'Based on your interests and expertise',
    followersCount: 2560,
  },
  {
    id: 2,
    fullName: 'Prof. Liam Chen',
    firstName: 'Liam',
    lastName: 'Chen',
    profileImage: 'https://randomuser.me/api/portraits/men/52.jpg',
    headline: 'Genomics Researcher',
    profileUrl: '/profile/2',
    isClaimed: true,
    hIndex: 35,
    worksCount: 98,
    institution: 'Stanford University',
    suggestionReason: 'Coauthor on one of your papers',
    followersCount: 1780,
  },
  {
    id: 3,
    fullName: 'Dr. Olivia Patel',
    firstName: 'Olivia',
    lastName: 'Patel',
    profileImage: 'https://randomuser.me/api/portraits/women/72.jpg',
    headline: 'Longevity Scientist',
    profileUrl: '/profile/3',
    isClaimed: true,
    hIndex: 28,
    worksCount: 75,
    institution: 'Longevity Lab',
    suggestionReason: 'Based on your interests and expertise',
    followersCount: 1340,
  },
  {
    id: 4,
    fullName: 'Dr. Ethan Williams',
    firstName: 'Ethan',
    lastName: 'Williams',
    profileImage: 'https://randomuser.me/api/portraits/men/41.jpg',
    headline: 'Forensic Medicine',
    profileUrl: '/profile/4',
    isClaimed: true,
    hIndex: 30,
    worksCount: 89,
    institution: 'Johns Hopkins University',
    suggestionReason: 'Coauthor on one of your papers',
    followersCount: 990,
  },
  {
    id: 5,
    fullName: 'Dr. Mia Nakamura',
    firstName: 'Mia',
    lastName: 'Nakamura',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    headline: 'Neurodegenerative Disease Researcher',
    profileUrl: '/profile/5',
    isClaimed: true,
    hIndex: 40,
    worksCount: 110,
    institution: 'UC San Francisco',
    suggestionReason: 'Based on your interests and expertise',
    followersCount: 2210,
  },
];
