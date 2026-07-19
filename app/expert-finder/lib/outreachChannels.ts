import type { ExpertSourceLink } from '@/types/expertFinder';

export type OutreachSocialNetwork = 'linkedin' | 'x';

export function buildMailtoHref(params: { to: string; subject: string }): string {
  const to = params.to.trim();
  const subject = params.subject.trim();
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${to}${query}`;
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function getSourceUrlByNetwork(
  sources: ExpertSourceLink[] | null | undefined,
  network: OutreachSocialNetwork
): string | null {
  if (!sources?.length) return null;

  for (const source of sources) {
    const url = source.url?.trim();
    if (!url) continue;
    const hostname = hostnameFromUrl(url);
    const combined = `${url} ${source.text ?? ''}`.toLowerCase();

    if (network === 'linkedin') {
      if (hostname.includes('linkedin.com') || combined.includes('linkedin')) {
        return url;
      }
      continue;
    }

    if (
      hostname === 'x.com' ||
      hostname === 'twitter.com' ||
      hostname.endsWith('.x.com') ||
      hostname.endsWith('.twitter.com') ||
      combined.includes('twitter.com/') ||
      combined.includes('x.com/')
    ) {
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
