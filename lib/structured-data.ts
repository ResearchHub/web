import { SITE_CONFIG } from '@/lib/metadata';

interface Document {
  title?: string;
  abstract?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    type?: string;
    alt?: string;
  }>;
  createdDate?: string;
  updatedDate?: string;
  expirationDate?: string;
  authors?: Array<{ name: string; url?: string }>;
  citations?: Array<{ name: string; url?: string }>;
  tags?: string[];
  section?: string;
  type?: string;
  /** schema.org type for the page, e.g. ScholarlyArticle. Defaults to Article. */
  schemaType?: string;
}

export function generateDocumentStructuredData(document: Document) {
  if (!document) return null;

  const headline = document.title || '';
  const truncatedHeadline = headline.length > 60 ? headline.substring(0, 57) + '...' : headline;

  return {
    '@context': 'https://schema.org',
    '@type': getSchemaType(document),
    headline: truncatedHeadline,
    description: document.abstract || document.title || '',
    ...(document.images?.[0]?.url && {
      image: {
        '@type': 'ImageObject',
        url: document.images[0].url,
        width: document.images[0].width || 1200,
        height: document.images[0].height || 630,
        ...(document.images[0].type && { encodingFormat: document.images[0].type }),
        ...(document.images[0].alt && { caption: document.images[0].alt }),
      },
    }),
    ...(document.createdDate && { datePublished: document.createdDate }),
    ...(document.updatedDate && { dateModified: document.updatedDate }),
    ...(document.expirationDate && { dateCreated: document.expirationDate }),
    ...(document.authors &&
      document.authors.length > 0 && {
        author: document.authors.map((author) => ({
          '@type': 'Person',
          name: author.name,
          ...(author.url && { url: author.url }),
        })),
      }),
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
        width: 512,
        height: 512,
      },
      url: SITE_CONFIG.url,
    },
    ...(document.section && { articleSection: document.section }),
    ...(document.tags && document.tags.length > 0 && { keywords: document.tags.join(', ') }),
    ...(document.citations &&
      document.citations.length > 0 && {
        citation: document.citations.map((citation) => ({
          '@type': 'CreativeWork',
          name: citation.name || 'Citation',
          ...(citation.url && { url: citation.url }),
        })),
      }),
    inLanguage: 'en-US',
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description:
      'ResearchHub is an open platform designed to accelerate the speed and transparency of science through open-access publishing, paid peer review, and a transparent funding marketplace.',
    sameAs: [
      'https://x.com/researchhub',
      'https://github.com/ResearchHub',
      'https://www.linkedin.com/company/researchhub',
    ],
    foundingDate: '2019',
    knowsAbout: [
      'Open Science',
      'Peer Review',
      'Research Funding',
      'Scientific Publishing',
      'Preregistration',
      'Reproducibility',
    ],
    founders: [
      { '@type': 'Person', name: 'Brian Armstrong', jobTitle: 'Cofounder, CEO' },
      { '@type': 'Person', name: 'Patrick Joyce', jobTitle: 'Cofounder, COO' },
    ],
    member: [
      { '@type': 'Person', name: 'Kobe Attias', jobTitle: 'Founding Engineer' },
      { '@type': 'Person', name: 'Taki Koustomitis', jobTitle: 'Founding Engineer' },
      { '@type': 'Person', name: 'Tyler Diorio', jobTitle: 'Chief of Staff' },
    ],
  };
}

export function buildProfileSEOMeta(profile: {
  name: string;
  firstName?: string;
  lastName?: string;
  url: string;
  image?: string;
  headline?: string;
  description?: string;
}): Record<string, string> {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      ...(profile.firstName && { givenName: profile.firstName }),
      ...(profile.lastName && { familyName: profile.lastName }),
      url: `${SITE_CONFIG.url}${profile.url}`,
      ...(profile.image && { image: profile.image }),
      ...(profile.headline && { jobTitle: profile.headline }),
      ...(profile.description && { description: profile.description }),
    },
  };

  return {
    ...(profile.firstName && { 'profile:first_name': profile.firstName }),
    ...(profile.lastName && { 'profile:last_name': profile.lastName }),
    'application/ld+json': JSON.stringify(jsonLd),
  };
}

export function generateFAQStructuredData(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export interface GrantStructuredDataInput {
  /** Full title. Unlike the article headline, this is not truncated. */
  title: string;
  description?: string;
  /** Absolute canonical URL of the RFP page. */
  url: string;
  organization?: string;
  amount?: { value: number; currency: string };
  /** Grant status, e.g. OPEN, CLOSED, COMPLETED. */
  status: string;
  /** Application deadline, ISO 8601. */
  endDate?: string;
  /** FUNDING is a community goal. AWARD is a pool the funder pays from directly. */
  fundingMechanism?: string;
  /** Cover image. MonetaryGrant inherits image from Thing. */
  image?: string;
  /** Short title, when it differs from the page title. */
  alternateName?: string;
  /** Proposals this grant has already put money toward. */
  fundedItems?: Array<{ name: string; url: string }>;
}

/**
 * schema.org MonetaryGrant for a public RFP. Schema.org has no deadline or
 * status property on Grant, so those go in additionalProperty.
 */
export interface ProposalStructuredDataInput {
  title: string;
  description?: string;
  /** Absolute canonical URL of the proposal page. */
  url: string;
  /** The RFP's funder, when the proposal applies to one. */
  funder?: string;
  /** Funding goal in the goal's currency. */
  goal?: { value: number; currency: string };
  /** Fundraise status, e.g. OPEN, COMPLETED. */
  status?: string;
  /** Fundraise deadline, ISO 8601. */
  endDate?: string;
  /** FUNDING when the proposal sets a goal. AWARD when the funder pays it directly. */
  fundingMechanism?: string;
  /** Title of the RFP this proposal applies to. */
  fundingName?: string;
  /** Absolute URL of that RFP. */
  fundingUrl?: string;
  /** Cover image. ResearchProject inherits image from Thing. */
  image?: string;
  /** People on the project. ResearchProject has member, not author. */
  members?: Array<{ name: string; url?: string }>;
}

/**
 * schema.org ResearchProject for a proposal. The goal is what the project asks
 * for. Amount raised is left out because it changes after the HTML is cached.
 * Peer review content is never included here.
 */
export function generateProposalStructuredData(proposal: ProposalStructuredDataInput) {
  const additionalProperty = [
    ...(proposal.fundingMechanism
      ? [{ '@type': 'PropertyValue', name: 'fundingMechanism', value: proposal.fundingMechanism }]
      : []),
    ...(proposal.status
      ? [{ '@type': 'PropertyValue', name: 'fundraiseStatus', value: proposal.status }]
      : []),
    ...(proposal.endDate
      ? [{ '@type': 'PropertyValue', name: 'fundingDeadline', value: proposal.endDate }]
      : []),
  ];

  const funding =
    proposal.goal || proposal.fundingName || proposal.fundingUrl || proposal.funder
      ? {
          '@type': 'MonetaryGrant',
          ...(proposal.fundingName && { name: proposal.fundingName }),
          ...(proposal.fundingUrl && { url: proposal.fundingUrl }),
          ...(proposal.funder && {
            funder: { '@type': 'Organization', name: proposal.funder },
          }),
          ...(proposal.goal && {
            amount: {
              '@type': 'MonetaryAmount',
              currency: proposal.goal.currency,
              value: proposal.goal.value,
            },
          }),
        }
      : undefined;

  const members = proposal.members?.filter((member) => member.name) ?? [];

  return {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: proposal.title,
    ...(proposal.description && { description: proposal.description }),
    url: proposal.url,
    ...(proposal.image && { image: proposal.image }),
    ...(proposal.funder && {
      funder: { '@type': 'Organization', name: proposal.funder },
    }),
    ...(funding && { funding }),
    ...(members.length > 0 && {
      member: members.map((member) => ({
        '@type': 'Person',
        name: member.name,
        ...(member.url && { url: member.url }),
      })),
    }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
  };
}

export function generateGrantStructuredData(grant: GrantStructuredDataInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MonetaryGrant',
    name: grant.title,
    ...(grant.description && { description: grant.description }),
    url: grant.url,
    ...(grant.image && { image: grant.image }),
    ...(grant.alternateName && { alternateName: grant.alternateName }),
    ...(grant.organization && {
      funder: { '@type': 'Organization', name: grant.organization },
    }),
    ...(grant.amount && {
      amount: {
        '@type': 'MonetaryAmount',
        currency: grant.amount.currency,
        value: grant.amount.value,
      },
    }),
    ...(grant.fundedItems &&
      grant.fundedItems.length > 0 && {
        fundedItem: grant.fundedItems.map((item) => ({
          '@type': 'ResearchProject',
          name: item.name,
          url: item.url,
        })),
      }),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'status', value: grant.status },
      ...(grant.fundingMechanism
        ? [{ '@type': 'PropertyValue', name: 'fundingMechanism', value: grant.fundingMechanism }]
        : []),
      ...(grant.endDate
        ? [{ '@type': 'PropertyValue', name: 'applicationDeadline', value: grant.endDate }]
        : []),
    ],
  };
}

function getSchemaType(document: Document): string {
  return document.schemaType ?? 'Article';
}
