import { SITE_CONFIG } from '@/lib/metadata';
import type { Work } from '@/types/work';
import { stripHtml } from '@/utils/stringUtils';

function pageUrl(path: string): string {
  return `${SITE_CONFIG.url}${path}`;
}

function lines(rows: Array<[string, string | undefined]>): string {
  return rows
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([label, value]) => `- ${label}: ${value}`)
    .join('\n');
}

/**
 * A community proposal's funding goal. Award applications publish a budget of 0
 * because the funder pays them directly, and a zero amount is not a goal.
 */
function proposalGoal(work: Work): string | undefined {
  const fundraise = work.fundraise;
  if (!fundraise || work.linkedGrant?.fundingMechanism === 'AWARD') return undefined;
  const value =
    fundraise.goalCurrency === 'USD' ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  if (value <= 0) return undefined;
  return `${value} ${fundraise.goalCurrency}`;
}

function body(work: Work): string {
  const text = stripHtml(work.previewContent || work.abstract || '').trim();
  return text ? `\n\n## Details\n\n${text}` : '';
}

/** Public RFP as markdown. Peer review text is never included. */
export function renderRfpMarkdown(work: Work, path: string): string {
  const grant = work.note?.post?.grant;
  const amount = grant?.amount ? `${grant.amount.usd} ${grant.currency}` : undefined;
  const facts = lines([
    ['URL', pageUrl(path)],
    ['Funder', grant?.organization || undefined],
    ['Amount', amount],
    ['Status', grant?.status],
    ['Application deadline', grant?.endDate || undefined],
    ['Funding', grant?.fundingMechanism],
  ]);

  return `# ${work.title}\n\n${facts}${body(work)}\n`;
}

/** Public proposal as markdown. Peer review text is never included. */
export function renderProposalMarkdown(work: Work, path: string): string {
  const linked = work.linkedGrant;
  const rfpUrl = linked?.postId ? pageUrl(`/rfp/${linked.postId}`) : undefined;
  const facts = lines([
    ['URL', pageUrl(path)],
    ['Funder', linked?.organization || undefined],
    ['Request for Proposal', rfpUrl],
    ['Goal', proposalGoal(work)],
    ['Status', work.fundraise?.status],
    ['Funding deadline', work.fundraise?.endDate],
    ['Funding', linked?.fundingMechanism],
  ]);

  return `# ${work.title}\n\n${facts}${body(work)}\n`;
}
