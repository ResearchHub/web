import { Node, mergeAttributes, type RawCommands } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Plugin } from '@tiptap/pm/state';
import { classifyUrl, type UrlKind } from '@/utils/url';
import { InlineRichLink } from '@/components/Embed';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    richLink: {
      /**
       * Replace the richLink atom at `pos` with a plain text node carrying a
       * `link` mark, where the visible text is the URL itself. Used by the
       * link bubble menu to "demote" a chip back to an editable plain link
       * (so the user can rename the anchor text via the existing flow).
       */
      convertRichLinkToLink: (pos: number) => ReturnType;
      /**
       * Wrap the link mark covering `[from, to]` (or expand from the current
       * selection) with a richLink atom. Used to "promote" a plain link into
       * a card-style chip. The link's previous anchor text is dropped — the
       * chip generates its own label from the URL preview.
       */
      convertLinkToRichLink: () => ReturnType;
    };
  }
}

/**
 * `richLink` is an inline atom node that represents a single URL inside
 * a comment's prose. It stores just the URL plus the lightweight
 * classification fields, and renders via `<InlineRichLink>` — the same
 * component the read-only renderer uses, so editor and read-only output
 * look identical and there is one source of truth for inline link styling.
 *
 * Paste behaviour: when the clipboard contains exactly a single URL we
 * intercept the paste and insert a `richLink` node instead of the default
 * Link mark. Any other paste falls through to TipTap's normal handling
 * (Link's paste rule, etc.) — so URLs typed mid-sentence or pasted with
 * surrounding text continue to behave normally as link marks; the read-only
 * renderer's normalization step picks those up at render time.
 *
 * Schema choice: inline + atom + selectable mirrors how `Mention` and other
 * inline chips work in this codebase. `parseHTML` matches the serialised
 * `<a data-type="rich-link" href="…">` tag we emit, so the JSON ↔ HTML
 * round-trip is symmetric.
 */

const STANDALONE_URL = /^https?:\/\/\S+$/;

interface RichLinkAttrs {
  url: string | null;
  kind: UrlKind | null;
  videoId: string | null;
  tweetId: string | null;
  linkedinUrn: string | null;
}

const RichLinkNodeView = ({ node }: NodeViewProps) => {
  const attrs = node.attrs as RichLinkAttrs;
  if (!attrs.url) return null;
  // Re-derive the embed from the URL on every render rather than trusting the
  // stored attrs. classifyUrl is deterministic and pure, and this means any
  // legacy richLink whose stored attrs were set by an older (less complete)
  // classifier (e.g. `linkedinUrn:null` for a /posts/ URL) self-heals as soon
  // as the classifier improves — no doc migration needed.
  const embed = classifyUrl(attrs.url);
  return (
    // `as="span"` keeps the wrapper inline-valid inside a paragraph; the
    // editor still gets click/selection because ProseMirror attaches its
    // listeners on the wrapper regardless of element type.
    //
    // `vertical-align: middle` keeps the chip baseline-aligned with the
    // surrounding text without inheriting weird ascenders. `inline` (not
    // `inline-block`) avoids creating a stricter formatting context that
    // can interact poorly with the chip's own `inline-flex max-w-*` and
    // cause the favicon to expand to fill the available width.
    <NodeViewWrapper
      as="span"
      className="rich-link-node-view"
      style={{ display: 'inline', verticalAlign: 'middle' }}
    >
      <InlineRichLink url={attrs.url} embed={embed} disabled />
    </NodeViewWrapper>
  );
};

export const RichLinkExtension = Node.create({
  name: 'richLink',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      url: { default: null },
      kind: { default: null },
      videoId: { default: null },
      tweetId: { default: null },
      linkedinUrn: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="rich-link"]',
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const url = node.getAttribute('href') || node.getAttribute('data-url');
          if (!url) return false;
          return {
            url,
            kind: node.getAttribute('data-kind') as UrlKind | null,
            videoId: node.getAttribute('data-video-id'),
            tweetId: node.getAttribute('data-tweet-id'),
            linkedinUrn: node.getAttribute('data-linkedin-urn'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Serialise as a regular anchor so the URL is still meaningful in plain
    // HTML contexts (email digests, etc.) — `data-type="rich-link"` lets us
    // re-hydrate it back into a richLink node on parse.
    const attrs: Record<string, string> = {
      'data-type': 'rich-link',
      target: '_blank',
      rel: 'noopener noreferrer',
    };
    if (HTMLAttributes.url) attrs.href = String(HTMLAttributes.url);
    if (HTMLAttributes.kind) attrs['data-kind'] = String(HTMLAttributes.kind);
    if (HTMLAttributes.videoId) attrs['data-video-id'] = String(HTMLAttributes.videoId);
    if (HTMLAttributes.tweetId) attrs['data-tweet-id'] = String(HTMLAttributes.tweetId);
    if (HTMLAttributes.linkedinUrn) attrs['data-linkedin-urn'] = String(HTMLAttributes.linkedinUrn);

    // Default text content = the URL itself, so consumers without a richLink
    // parser still see something readable.
    return ['a', mergeAttributes(attrs), HTMLAttributes.url ?? ''];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RichLinkNodeView);
  },

  addCommands() {
    return {
      convertRichLinkToLink:
        (pos: number) =>
        ({ state, chain }) => {
          const node = state.doc.nodeAt(pos);
          if (!node || node.type.name !== 'richLink') return false;
          const url = node.attrs.url as string | null;
          if (!url) return false;
          const linkMarkType = state.schema.marks.link;
          if (!linkMarkType) return false;
          // Replace the atom with a text node + link mark. URL-as-anchor-text
          // is the most predictable default; the user can immediately rename
          // it via the existing link edit flow. `noRichPreview: true` tells
          // `normalizeRichLinks` (in both the editor's load path and the
          // read-only renderer) to skip the URL-text → chip upgrade that
          // would otherwise immediately undo this conversion.
          return chain()
            .focus()
            .insertContentAt(
              { from: pos, to: pos + node.nodeSize },
              {
                type: 'text',
                text: url,
                marks: [{ type: 'link', attrs: { href: url, noRichPreview: true } }],
              }
            )
            .run();
        },

      convertLinkToRichLink:
        () =>
        ({ state, chain }) => {
          const linkMarkType = state.schema.marks.link;
          const richLinkType = state.schema.nodes.richLink;
          if (!linkMarkType || !richLinkType) return false;
          // The user's selection is expected to sit inside the link mark
          // (clicking a link via the editor's handleClick already places the
          // caret there). We grab the href from the active link mark and let
          // `extendMarkRange` find the contiguous range of nodes carrying it.
          const linkMark = state.selection.$from.marks().find((m) => m.type === linkMarkType);
          if (!linkMark) return false;
          const href = linkMark.attrs.href as string | undefined;
          if (!href) return false;
          const detected = classifyUrl(href);
          if (!detected) return false;
          return chain()
            .focus()
            .extendMarkRange('link')
            .command(({ tr, state: s }) => {
              const richLinkNode = richLinkType.create({
                url: detected.url,
                kind: detected.kind,
                videoId: detected.videoId ?? null,
                tweetId: detected.tweetId ?? null,
                linkedinUrn: detected.linkedinUrn ?? null,
              });
              const { from, to } = s.selection;
              tr.replaceWith(from, to, richLinkNode);
              return true;
            })
            .run();
        },
    } satisfies Partial<RawCommands>;
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          // Runs before TipTap's Link paste rule. We only intercept when the
          // paste *is* exactly a single URL so users can still paste prose
          // containing URLs without surprises.
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')?.trim();
            if (!text || !STANDALONE_URL.test(text)) return false;

            const detected = classifyUrl(text);
            if (!detected) return false;

            const richLinkType = view.state.schema.nodes.richLink;
            if (!richLinkType) return false;

            const node = richLinkType.create({
              url: detected.url,
              kind: detected.kind,
              videoId: detected.videoId ?? null,
              tweetId: detected.tweetId ?? null,
              linkedinUrn: detected.linkedinUrn ?? null,
            });

            const tr = view.state.tr.replaceSelectionWith(node, false).scrollIntoView();
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});
