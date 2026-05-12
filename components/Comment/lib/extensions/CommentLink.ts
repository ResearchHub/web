import { Link } from '@tiptap/extension-link';

/**
 * Comment-flavoured `Link` mark.
 *
 * Adds a single boolean attribute, `noRichPreview`, that signals "this link
 * was deliberately demoted from a richLink chip to a plain link — leave it
 * alone on render". Set by `RichLinkExtension.convertRichLinkToLink` (the
 * "Show as link" button in the bubble menu) and consumed by
 * `normalizeRichLinks` to skip the URL-text → chip upgrade for that one
 * mark.
 *
 * The attribute round-trips through HTML as `data-no-rich-preview="true"`,
 * so it survives any persistence layer that goes through TipTap's parser.
 * Default is `false`, so every existing comment in the wild continues to
 * upgrade exactly as before — this change is purely additive opt-out.
 */
export const CommentLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      noRichPreview: {
        default: false,
        parseHTML: (el) => el.getAttribute('data-no-rich-preview') === 'true',
        renderHTML: (attrs) => (attrs.noRichPreview ? { 'data-no-rich-preview': 'true' } : {}),
      },
    };
  },
});
