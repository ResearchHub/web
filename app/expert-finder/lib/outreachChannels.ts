import type { ExpertSourceLink, OutreachChannel } from '@/types/expertFinder';
import { OUTREACH_CHANNEL_VALUES } from '@/types/expertFinder';
import { ensureAbsoluteHttpUrl, isLinkedInUrl, isXUrl } from '@/utils/url';

export type OutreachSocialNetwork = 'linkedin' | 'x';

export const OUTREACH_CHANNEL_LABELS: Record<OutreachChannel, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  x: 'X',
};

export const OUTREACH_CHANNEL_OPTIONS: { value: OutreachChannel; label: string }[] =
  OUTREACH_CHANNEL_VALUES.map((value) => ({
    value,
    label: OUTREACH_CHANNEL_LABELS[value],
  }));

export function getOutreachChannelLabels(channels: OutreachChannel[] | null | undefined): string[] {
  return (channels ?? []).map((channel) => OUTREACH_CHANNEL_LABELS[channel]);
}

/** Open Gmail compose (browser) with to/subject; body is copied separately for rich paste. */
export function buildGmailComposeHref(params: { to: string; subject: string }): string {
  const search = new URLSearchParams({ view: 'cm', fs: '1' });
  const to = params.to.trim();
  const subject = params.subject.trim();
  if (to) search.set('to', to);
  if (subject) search.set('su', subject);
  return `https://mail.google.com/mail/?${search.toString()}`;
}

export function getSourceUrlByNetwork(
  sources: ExpertSourceLink[] | null | undefined,
  network: OutreachSocialNetwork
): string | null {
  if (!sources?.length) return null;

  for (const source of sources) {
    const url = ensureAbsoluteHttpUrl(source.url ?? '') || source.url?.trim();
    if (!url) continue;

    if (network === 'linkedin' && isLinkedInUrl(url, source.text)) {
      return url;
    }
    if (network === 'x' && isXUrl(url, source.text)) {
      return url;
    }
  }

  return null;
}

function htmlToPlainText(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\u00a0/g, ' ').trim();
}

/** Copy message body (HTML + plain) for paste into personal inbox / social DMs. */
export async function copyOutreachBodyToClipboard(emailBody: string): Promise<boolean> {
  const html = emailBody.trim();
  if (!html) return false;

  const plainText = htmlToPlainText(html);
  try {
    if (typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([plainText || html], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(plainText || html);
    }
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(plainText || html);
      return true;
    } catch {
      return false;
    }
  }
}
