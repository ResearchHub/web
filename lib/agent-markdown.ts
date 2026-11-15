import { SITE_CONFIG } from '@/lib/metadata';
import { proposalGoal, storedGrantAmount } from '@/lib/metadata-helpers';
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

function goalLabel(work: Work): string | undefined {
  const goal = proposalGoal(work.fundraise, work.linkedGrant?.fundingMechanism);
  return goal ? `${goal.value} ${goal.currency}` : undefined;
}

function body(work: Work): string {
  const text = stripHtml(work.previewContent || work.abstract || '').trim();
  return text ? `\n\n## Details\n\n${text}` : '';
}

/** Public RFP as markdown. Peer review text is never included. */
export function renderRfpMarkdown(work: Work, path: string): string {
  const grant = work.note?.post?.grant;
  const amount = storedGrantAmount(grant?.amount, grant?.currency);
  const amountLabel = amount ? `${amount.value} ${amount.currency}` : undefined;
  const facts = lines([
    ['URL', pageUrl(path)],
    ['Funder', grant?.organization || undefined],
    ['Amount', amountLabel],
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
    ['Goal', goalLabel(work)],
    ['Status', work.fundraise?.status],
    ['Funding deadline', work.fundraise?.endDate],
    ['Funding', linked?.fundingMechanism],
  ]);

  return `# ${work.title}\n\n${facts}${body(work)}\n`;
}
