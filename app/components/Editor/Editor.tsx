'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { SettingsContext } from './context/SettingsContext';
import PlaygroundEditor from './PlaygroundEditor';
import './styles.css';
import { ToolbarContext } from './context/ToolbarContext';
import { TableContext } from './plugins/TablePlugin';
import { FlashMessageContext } from './context/FlashMessageContext';

// Import nodes
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HashtagNode } from '@lexical/hashtag';

import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ImageNode } from './nodes/ImageNode';
import { PageBreakNode } from './nodes/PageBreakNode';
import { PollNode } from './nodes/PollNode';

// import { StickyNode } from './nodes/StickyNode';
import { TweetNode } from './nodes/TweetNode';
import { YouTubeNode } from './nodes/YouTubeNode';
import { EquationNode } from './nodes/EquationNode';
import { CollapsibleContainerNode } from './plugins/CollapsiblePlugin/CollapsibleContainerNode';
import { CollapsibleContentNode } from './plugins/CollapsiblePlugin/CollapsibleContentNode';
import { CollapsibleTitleNode } from './plugins/CollapsiblePlugin/CollapsibleTitleNode';
import { AutocompleteNode } from './nodes/AutocompleteNode';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { EmojiNode } from './nodes/EmojiNode';
import { KeywordNode } from './nodes/KeywordNode';
import { InlineImageNode } from './nodes/InlineImageNode/InlineImageNode';
import { LayoutItemNode } from './nodes/LayoutItemNode';
import { LayoutContainerNode } from './nodes/LayoutContainerNode';

const initialSettings = {
  isCollab: false,
  isRichText: true,
  isAutocomplete: false,
  isMaxLength: false,
  isCharLimit: false,
  isCharLimitUtf8: false,
  showTreeView: false,
  showTableOfContents: false,
  shouldUseLexicalContextMenu: false,
  shouldPreserveNewLinesInMarkdown: true,
  tableCellMerge: true,
  tableCellBackgroundColor: true,
  tableHorizontalScroll: true,
  hasLinkAttributes: true,
};

// All Nodes that are used within the editor
const nodes = [
  AutoLinkNode,
  CodeHighlightNode,
  CodeNode,
  HeadingNode,
  HorizontalRuleNode,
  LinkNode,
  ListNode,
  ListItemNode,
  MarkNode,
  OverflowNode,
  QuoteNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  ImageNode,
  InlineImageNode,
  PollNode,
  LayoutContainerNode,
  EmojiNode,
  PageBreakNode,
  LayoutItemNode,
  // StickyNode,
  TweetNode,
  YouTubeNode,
  EquationNode,
  KeywordNode,
  HashtagNode,
  AutocompleteNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
];

const initialConfig = {
  namespace: 'ResearchHub',
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
  theme: PlaygroundEditorTheme,
};

export default function Editor(): JSX.Element {
  return (
    <SettingsContext.Provider value={initialSettings}>
      <FlashMessageContext>
        <LexicalComposer initialConfig={initialConfig}>
          <SharedHistoryContext>
            <TableContext>
              <ToolbarContext>
                <div className="editor-shell">
                  <PlaygroundEditor />
                </div>
              </ToolbarContext>
            </TableContext>
          </SharedHistoryContext>
        </LexicalComposer>
      </FlashMessageContext>
    </SettingsContext.Provider>
  );
} 