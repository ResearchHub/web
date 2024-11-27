import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { HashtagNode } from '@lexical/hashtag';

export const defaultEditorConfig = {
  namespace: 'ResearchHubEditor',
  theme: {
    // Add your theme configuration here
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
  onError: (error: Error) => {
    console.error(error);
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListItemNode,
    ListNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    CodeHighlightNode,
    CodeNode,
    AutoLinkNode,
    LinkNode,
    HashtagNode,
  ],
}; 