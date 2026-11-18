import {
  buildArticleMetadata,
  buildDefaultOgImageUrl,
  buildOpenGraphMetadata,
  SITE_CONFIG,
} from '@/lib/metadata';
import {
  generateDocumentStructuredData,
  generateGrantStructuredData,
  generateProposalStructuredData,
} from '@/lib/structured-data';
import type { Grant } from '@/types/grant';
import { Work } from '@/types/work';
import { stripHtml } from '@/utils/stringUtils';

function getWorkDescription(work: Work): string {
  const previewText = stripHtml(work.previewContent || '').substring(0, 155);
  return work.abstract || previewText || work.title;
}

function getWorkImage(work: Work): string | undefined {
  return work.image || work.figures?.[0]?.url;
}

/** The image social sites show in a work's link card: the same one its page metadata sets. */
export function getWorkShareImageUrl(work: Work): string {
  return getWorkImage(work) || buildDefaultOgImageUrl(work.title, getWorkDescription(work));
}

/**
 * A community proposal's funding goal. Award applications publish a budget of 0
 * because the funder pays them directly, and a zero amount is not a goal.
 */
export function proposalGoal(
  fundraise: Work['fundraise'],
  fundingMechanism: string | undefined
): { value: number; currency: string } | undefined {
  if (!fundraise || fundingMechanism === 'AWARD') return undefined;
  const value =
    fundraise.goalCurrency === 'USD' ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  if (value <= 0) return undefined;
  return { value, currency: fundraise.goalCurrency };
}

/**
 * The grant's stored amount. `usd` is float(grant.amount); `rsc` is an exchange
 * conversion of that number, so the published value stays `usd`. `currency` is
 * the unit of the stored amount.
 */
export function storedGrantAmount(
  amount: { usd: number } | undefined,
  currency: string | undefined
): { value: number; currency: string } | undefined {
  if (!amount || !currency) return undefined;
  return { value: amount.usd, currency };
}

/** Proposals this grant has put money toward. Open applications with nothing raised are not funded yet. */
function fundedGrantItems(
  applications: Grant['applications']
): Array<{ name: string; url: string }> {
  return (applications ?? []).flatMap((application) => {
    const raised = application.fundraise?.amountRaised;
    const hasMoney = (raised?.usd ?? 0) > 0 || (raised?.rsc ?? 0) > 0;
    const postId = application.preregistrationPostId;
    const name = application.fundraise?.title;
    if (!hasMoney || postId == null || !name) return [];
    return [{ name, url: `${SITE_CONFIG.url}/proposal/${postId}` }];
  });
}

/** schema.org data for a work page: a grant, a proposal, a paper, or the generic article. */
function buildWorkStructuredData(work: Work, url: string, description: string, grant?: Grant) {
  const absoluteUrl = `${SITE_CONFIG.url}${url}`;

  if (work.contentType === 'funding_request') {
    if (grant) {
      return generateGrantStructuredData({
        title: work.title,
        description: stripHtml(grant.description || ''),
        url: absoluteUrl,
        organization: grant.organization,
        amount: storedGrantAmount(grant.amount, grant.currency),
        status: grant.status,
        endDate: grant.endDate,
        fundingMechanism: grant.fundingMechanism,
        image: work.image,
        alternateName:
          grant.shortTitle && grant.shortTitle !== work.title ? grant.shortTitle : undefined,
        fundedItems: fundedGrantItems(grant.applications),
      });
    }
  }

  if (work.contentType === 'preregistration') {
    const fundraise = work.fundraise;
    return generateProposalStructuredData({
      title: work.title,
      description,
      url: absoluteUrl,
      funder: work.linkedGrant?.organization || undefined,
      goal: proposalGoal(fundraise, work.linkedGrant?.fundingMechanism),
      status: fundraise?.status,
      endDate: fundraise?.endDate,
      fundingMechanism: work.linkedGrant?.fundingMechanism,
      fundingName: work.linkedGrant?.shortTitle || work.linkedGrant?.title || undefined,
      fundingUrl: work.linkedGrant?.postId
        ? `${SITE_CONFIG.url}/rfp/${work.linkedGrant.postId}`
        : undefined,
      image: work.image,
      members: work.authors
        .filter((author) => author.authorProfile?.fullName)
        .map((author) => ({
          name: author.authorProfile.fullName,
          url: author.authorProfile.profileUrl
            ? `${SITE_CONFIG.url}${author.authorProfile.profileUrl}`
            : undefined,
        })),
    });
  }

  return generateDocumentStructuredData({
    ...work,
    schemaType: work.contentType === 'paper' ? 'ScholarlyArticle' : undefined,
    authors: work.authors?.map((a) => ({
      name: a.authorProfile?.fullName || '',
      url: a.authorProfile?.profileUrl,
    })),
  });
}

export function getWorkMetadata({
  work,
  url,
  grant = work.note?.post?.grant,
  titleSuffix = '',
}: {
  work: Work;
  url: string;
  grant?: Grant;
  titleSuffix?: string;
}) {
  const title = `${work.title}${titleSuffix ? ` - ${titleSuffix}` : ''}`;
  const description = getWorkDescription(work);
  const topics = work.contentType === 'paper' ? work.topics : undefined;

  const structuredData = buildWorkStructuredData(work, url, description, grant);

  const articleMetadata = buildArticleMetadata({
    title,
    description,
    url,
    image: getWorkImage(work),
    publishedTime: work.publishedDate || work.createdDate,
    modifiedTime: work.updatedDate,
    authors: work.authors?.map((a) => a.authorProfile?.fullName) || [],
    section: topics?.[0]?.name,
    tags: topics?.map((topic) => topic.name),
  });

  return {
    ...articleMetadata,
    other: {
      ...(articleMetadata.other as Record<string, string>),
      ...(structuredData && { 'application/ld+json': JSON.stringify(structuredData) }),
    },
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
    : 'Refer a Funder, Accelerate Science';

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
    image: '/referral/lab.webp',
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
