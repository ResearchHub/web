import { QuillContent, UserMention } from '@/types/comment';

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, any> }[];
  text?: string;
}

interface TipTapDoc {
  type: 'doc';
  content: TipTapNode[];
}

export function convertQuillDeltaToTipTap(delta: QuillContent): TipTapDoc {
  console.log('delta', delta);

  const content: TipTapNode[] = [];
  let currentParagraph: TipTapNode = {
    type: 'paragraph',
    content: [],
  };

  delta.ops.forEach((op) => {
    if (typeof op.insert === 'string') {
      const text: TipTapNode = { type: 'text', text: op.insert };
      const marks: { type: string; attrs?: Record<string, any> }[] = [];

      // Convert Quill attributes to TipTap marks
      if (op.attributes) {
        if (op.attributes.bold) marks.push({ type: 'bold' });
        if (op.attributes.italic) marks.push({ type: 'italic' });
        if (op.attributes.underline) marks.push({ type: 'underline' });
        if (op.attributes.link) marks.push({ type: 'link', attrs: { href: op.attributes.link } });
        if (op.attributes.code) marks.push({ type: 'code' });
      }

      if (marks.length > 0) {
        text.marks = marks;
      }

      if (op.insert === '\n') {
        if (currentParagraph.content && currentParagraph.content.length > 0) {
          content.push(currentParagraph);
          currentParagraph = {
            type: 'paragraph',
            content: [],
          };
        }
      } else {
        currentParagraph.content?.push(text);
      }
    } else if (typeof op.insert === 'object' && op.insert.user) {
      // Handle user mentions
      const user = op.insert.user;
      const mention: TipTapNode = {
        type: 'mention',
        attrs: {
          id: user.authorProfileId || user.userId,
          label: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
        },
      };
      currentParagraph.content?.push(mention);
    }
  });

  // Push the last paragraph if it has content
  if (currentParagraph.content && currentParagraph.content.length > 0) {
    content.push(currentParagraph);
  }

  return {
    type: 'doc',
    content,
  };
}
