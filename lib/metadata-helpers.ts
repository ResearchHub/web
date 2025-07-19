import { buildArticleMetadata, buildOpenGraphMetadata } from '@/lib/metadata';
import { generateDocumentStructuredData } from '@/lib/structured-data';
import { Work } from '@/types/work';
import { truncateText } from '@/utils/stringUtils';

export function getWorkMetadata({
  work,
  url,
  titleSuffix = '',
}: {
  work: Work;
  url: string;
  titleSuffix?: string;
}) {
  const title = `${work.title}${titleSuffix ? ` - ${titleSuffix}` : ''}`;
  const description = truncateText(work.abstract || work.title, 65);

  const structuredData = generateDocumentStructuredData({
    ...work,
    authors: work.authors?.map((a) => ({
      name: a.authorProfile?.fullName || '',
      url: a.authorProfile?.profileUrl,
    })),
  });

  return {
    ...buildArticleMetadata({
      title,
      description,
      url,
      image: work.image,
      publishedTime: work.createdDate,
      authors: work.authors?.map((a) => a.authorProfile?.fullName) || [],
      tags: work.topics?.map((t) => t.name) || [],
    }),
    ...(structuredData && {
      other: {
        'application/ld+json': JSON.stringify(structuredData),
      },
    }),
  };
}

export function getReferralMetadata({
  url,
  isJoinPage = false,
  referralCode,
}: {
  url: string;
  isJoinPage?: boolean;
  referralCode?: string;
}) {
  const baseTitle = isJoinPage
    ? 'Join ResearchHub - Accelerate Science Together'
    : 'Refer a Funder, Accelerate Science - ResearchHub';

  const baseDescription = isJoinPage
    ? 'Join ResearchHub and accelerate science together. Get invited by a friend and earn bonus rewards when you fund research.'
    : 'Earn credits by inviting funders to ResearchHub. Share your referral link and both you and your referrals get 10% bonus on funding.';

  const title = referralCode ? `${baseTitle} (Invited by ${referralCode})` : baseTitle;

  const description = referralCode
    ? `${baseDescription} You were invited by a ResearchHub member.`
    : baseDescription;

  const baseMetadata = buildOpenGraphMetadata({
    title,
    description,
    url,
    image: '/images/lab.jpg',
    type: 'website',
    tags: [
      'ResearchHub',
      'Science Funding',
      'Research Collaboration',
      'Open Science',
      'Scientific Research',
      'Research Funding',
      'Academic Research',
      'Science Community',
      'Research Platform',
      'Scientific Collaboration',
    ],
    section: isJoinPage ? 'Join' : 'Referral',
  });

  return {
    ...baseMetadata,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}
