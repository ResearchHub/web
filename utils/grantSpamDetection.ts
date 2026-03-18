import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Work } from '@/types/work';

interface GrantSpamCheckInput {
  title?: string | null;
  description?: string | null;
  organization?: string | null;
  content?: string | null;
}

const PHONE_NUMBER_PATTERN = /\+?\d(?:[\s().-]*\d){8,}/i;
const MESSAGING_PATTERN = /\b(?:whatsapp|telegram|call(?:\s+now)?|text(?:\s+now)?|contact(?:\s+us)?|dm)\b/i;
const SALES_PATTERN = /\b(?:buy|order|delivery|for sale|cheap|price|prices|shop)\b/i;
const PHARMA_PATTERN = /\b(?:pills?|tablets?|cytotec|mifepristone|misoprostol|viagra|cialis)\b/i;

export const LIKELY_SPAM_GRANT_MESSAGE =
  'This grant looks like commercial spam. Remove phone numbers, sales language, or off-platform contact details before publishing.';

const normalizeGrantText = (value?: string | null): string => value?.trim().toLowerCase() ?? '';

export const getLikelySpamGrantSignals = ({
  title,
  description,
  organization,
  content,
}: GrantSpamCheckInput): string[] => {
  const combined = [title, description, organization, content]
    .map(normalizeGrantText)
    .filter(Boolean)
    .join(' ');

  const signals: string[] = [];

  if (PHONE_NUMBER_PATTERN.test(combined)) {
    signals.push('phone');
  }

  if (MESSAGING_PATTERN.test(combined)) {
    signals.push('messaging');
  }

  if (SALES_PATTERN.test(combined)) {
    signals.push('sales');
  }

  if (PHARMA_PATTERN.test(combined)) {
    signals.push('pharma');
  }

  return signals;
};

export const isLikelySpamGrantContent = (input: GrantSpamCheckInput): boolean => {
  const signals = new Set(getLikelySpamGrantSignals(input));

  if (signals.has('phone') && signals.has('pharma')) {
    return true;
  }

  if (signals.has('phone') && signals.has('sales')) {
    return true;
  }

  if (signals.has('messaging') && signals.has('pharma')) {
    return true;
  }

  return false;
};

export const isLikelySpamGrantEntry = (entry: FeedEntry): boolean => {
  if (entry.contentType !== 'GRANT') {
    return false;
  }

  const content = entry.content as FeedGrantContent;

  return isLikelySpamGrantContent({
    title: content.title,
    description: content.grant?.description,
    organization: content.grant?.organization || content.organization,
    content: content.textPreview,
  });
};

export const isLikelySpamGrantWork = (work: Work): boolean => {
  if (work.contentType !== 'funding_request') {
    return false;
  }

  const grant = work.note?.post?.grant;

  return isLikelySpamGrantContent({
    title: work.title,
    description: grant?.description,
    organization: grant?.organization,
    content: work.previewContent,
  });
};
