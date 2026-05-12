import { classifyUrl, URL_REGEX, type DetectedUrl } from '@/utils/url';

/**
 * Helpers for working with rich-link / embed information inside a TipTap
 * comment document. Two responsibilities:
 *
 * 1. {@link extractDocEmbeds} — walk a doc and return a deduped list of
 *    `DetectedUrl`s for every URL it contains (text or `link` mark or
 *    `richLink` node). Used to populate the carousel below the comment.
 *
 * 2. {@link normalizeRichLinks} — rewrite a doc so URL-only text tokens and
 *    URL-only `link` marks become `richLink` inline nodes. Lets old comments
 *    render with the same inline rich preview as freshly pasted ones, with
 *    no backend migration. Idempotent and pure (returns a new doc).
 */

const TRIM_TRAILING = /[.,;:!?)\]]+$/;

const isUrlOnlyText = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\/\S+$/.test(trimmed)) return null;
  return trimmed.replace(TRIM_TRAILING, '');
};

/**
 * Best-effort canonical form of a URL-ish string for equality comparisons.
 * Strips scheme + trailing path slash so that visible text the user typed
 * without a scheme (e.g. `coldtherapy.acoer.com`) compares equal to the
 * fully-qualified href that TipTap's autolinker generates from it
 * (e.g. `http://coldtherapy.acoer.com`). Returns `null` for inputs that
 * aren't URL-like, which preserves the spec for intentionally different
 * anchor text (`[click here](https://…)` → "click here" doesn't parse,
 * so no match, so the link mark stays intact).
 */
const canonicalUrlKey = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Quick rejection: must look like at least `host.tld` or have a scheme.
  // Disallow whitespace so plain prose ("hello world") doesn't accidentally
  // canonicalize to garbage.
  if (/\s/.test(trimmed)) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) && !/^[\w-]+(?:\.[\w-]+)+/.test(trimmed)) {
    return null;
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    const pathname = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
    return `${u.host}${pathname}${u.search}${u.hash}`.toLowerCase();
  } catch {
    return null;
  }
};

const findLinkMarkHref = (marks: any[] | undefined): string | undefined => {
  if (!marks) return undefined;
  for (const mark of marks) {
    if (mark.type === 'link' && mark.attrs?.href) return mark.attrs.href;
  }
  return undefined;
};

/**
 * True if the text node carries a `link` mark that the user explicitly
 * demoted from a chip via the bubble menu (`noRichPreview: true`). When set,
 * we treat the link as authoritative and skip the URL-text → chip upgrade.
 */
const linkOptedOutOfRichPreview = (marks: any[] | undefined): boolean => {
  if (!marks) return false;
  return marks.some((m) => m.type === 'link' && m.attrs?.noRichPreview === true);
};

/**
 * Recursively visits every node in a TipTap document and yields any URL we
 * can detect — whether it's a `richLink` atom node, a `link` mark, or a
 * raw URL inside a text node. Used by both extraction and rendering paths.
 */
function* visitUrls(node: any): Generator<string> {
  if (!node) return;

  if (node.type === 'richLink' && node.attrs?.url) {
    yield String(node.attrs.url);
  }

  // Legacy block-level `embed` node (produced by the now-removed
  // EmbedExtension). Normalize migrates these to richLinks, but we still
  // visit them here so any code path that runs *before* normalization (or
  // skips it) doesn't lose the URL from the carousel.
  if (node.type === 'embed' && node.attrs?.url) {
    yield String(node.attrs.url);
  }

  if (node.type === 'text' && typeof node.text === 'string') {
    const linkHref = findLinkMarkHref(node.marks);
    if (linkHref) {
      yield String(linkHref);
    } else {
      const matches = node.text.match(URL_REGEX);
      if (matches) {
        for (const raw of matches) yield raw.replace(TRIM_TRAILING, '');
      }
    }
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) yield* visitUrls(child);
  }
}

/**
 * Returns a deduped list of `DetectedUrl`s for every URL in the doc.
 * Order matches first-appearance in the document so the carousel mirrors
 * the prose. Generic webpages are included so the carousel surfaces every
 * link the author shared (per product call: "all urls need a block").
 */
export function extractDocEmbeds(doc: any): DetectedUrl[] {
  if (!doc) return [];
  const seen = new Set<string>();
  const out: DetectedUrl[] = [];
  for (const url of visitUrls(doc)) {
    if (seen.has(url)) continue;
    const detected = classifyUrl(url);
    if (!detected) continue;
    seen.add(url);
    out.push(detected);
  }
  return out;
}

/**
 * Returns a new doc where:
 * - text nodes wrapped in a `link` mark whose visible text equals the href
 *   are replaced with a single `richLink` inline node, AND
 * - text nodes that contain a bare URL token (with optional whitespace) are
 *   split so the URL becomes a `richLink` and the surrounding text remains.
 *
 * Anchor text that *differs* from the href is preserved as a regular link —
 * we respect the author's chosen wording per the product spec.
 *
 * Idempotent: existing `richLink` nodes pass through untouched.
 */
export function normalizeRichLinks(doc: any): any {
  if (!doc || typeof doc !== 'object') return doc;
  return mapNode(doc);
}

function mapNode(node: any): any {
  if (!node || typeof node !== 'object') return node;

  // Already a rich link — leave alone.
  if (node.type === 'richLink') return node;

  // Legacy block-level `embed` node (from the removed EmbedExtension).
  // Convert to an inline richLink wrapped in a paragraph so the schema
  // accepts it (richLink is inline-only) and so the read-only renderer
  // and editor both render the same chip + carousel for these nodes.
  if (node.type === 'embed' && node.attrs?.url) {
    const richLink = {
      type: 'richLink',
      attrs: {
        url: node.attrs.url,
        kind: node.attrs.kind ?? null,
        videoId: node.attrs.videoId ?? null,
        tweetId: node.attrs.tweetId ?? null,
        linkedinUrn: node.attrs.linkedinUrn ?? null,
      },
    };
    return { type: 'paragraph', content: [richLink] };
  }

  // Text nodes: handle URL detection inline; we may emit *multiple* siblings
  // here, so callers that recurse into `content` need to flatten the result.
  if (node.type === 'text') {
    return rewriteTextNode(node);
  }

  if (Array.isArray(node.content)) {
    const next: any[] = [];
    for (const child of node.content) {
      const mapped = mapNode(child);
      if (Array.isArray(mapped)) next.push(...mapped);
      else if (mapped != null) next.push(mapped);
    }
    return { ...node, content: next };
  }

  return node;
}

function rewriteTextNode(node: any): any | any[] {
  const text: string = typeof node.text === 'string' ? node.text : '';
  if (!text) return node;

  // Case A: text wrapped in a link mark, and the visible text describes the
  // *same* URL as the href. The comparison is canonical (scheme + trailing
  // slash stripped) so that auto-linked bare hostnames like
  // `coldtherapy.acoer.com` (text) ↔ `http://coldtherapy.acoer.com` (href)
  // upgrade to a chip just like a fully-qualified URL would. Anchor text
  // that is genuinely different from the href (`[click here](…)`) returns
  // `null` from `canonicalUrlKey` and falls through unchanged. Links the
  // user explicitly demoted from a chip carry `noRichPreview` and are also
  // left alone, even when text == href.
  const linkHref = findLinkMarkHref(node.marks);
  if (linkHref) {
    if (linkOptedOutOfRichPreview(node.marks)) return node;
    const trimmed = text.trim();
    const textKey = canonicalUrlKey(trimmed);
    const hrefKey = canonicalUrlKey(linkHref);
    if (textKey != null && hrefKey != null && textKey === hrefKey) {
      const detected = classifyUrl(linkHref);
      if (detected) return makeRichLinkNode(detected);
    }
    // Different anchor text — leave the link mark intact.
    return node;
  }

  // Case B: bare text containing one or more URLs. Split around them so the
  // URL becomes a richLink and the rest of the text stays as text.
  const matches: { start: number; end: number; url: string }[] = [];
  // Reset regex state — URL_REGEX is global.
  URL_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_REGEX.exec(text))) {
    const raw = m[0];
    const url = raw.replace(TRIM_TRAILING, '');
    if (!classifyUrl(url)) continue;
    matches.push({
      start: m.index,
      end: m.index + url.length,
      url,
    });
  }
  if (matches.length === 0) return node;

  const out: any[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      out.push({ ...node, text: text.slice(cursor, match.start) });
    }
    const detected = classifyUrl(match.url);
    if (detected) out.push(makeRichLinkNode(detected));
    cursor = match.end;
  }
  if (cursor < text.length) {
    out.push({ ...node, text: text.slice(cursor) });
  }
  return out;
}

function makeRichLinkNode(embed: DetectedUrl) {
  return {
    type: 'richLink',
    attrs: {
      url: embed.url,
      kind: embed.kind,
      videoId: embed.videoId ?? null,
      tweetId: embed.tweetId ?? null,
      linkedinUrn: embed.linkedinUrn ?? null,
    },
  };
}
