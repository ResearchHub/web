import { Comment } from '@/types/comment';

export interface MentionItem {
  id: string | null;
  entityType: 'user' | 'author' | 'paper' | 'post';
  label: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  authorProfileId?: string | null;
  isVerified?: boolean;
  authorProfile?: {
    headline: string;
    profileImage: string | null;
  };
  // Paper specific fields
  authors?: string[];
  doi?: string;
  citations?: number;
  source?: string;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * Represents a TipTap text node
 */
export interface TipTapTextNode {
  type: 'text';
  text: string;
  marks?: Array<TipTapMark>;
}

/**
 * Represents a TipTap mark (formatting)
 */
export interface TipTapMark {
  type: string;
  attrs?: Record<string, any>;
}

/**
 * Represents a TipTap node (paragraph, heading, etc.)
 */
export interface TipTapNode {
  type: string;
  content?: Array<TipTapNode | TipTapTextNode>;
  attrs?: Record<string, any>;
  text?: string;
  marks?: Array<TipTapMark>;
}

/**
 * Represents a TipTap document
 */
export interface TipTapDocument {
  type: 'doc';
  content: Array<TipTapNode>;
}

/**
 * Represents a nested TipTap document (sometimes found in the API)
 */
export interface NestedTipTapDocument {
  content: TipTapDocument;
}

/**
 * Represents all possible comment content formats
 */
export type CommentContent =
  | TipTapDocument
  | NestedTipTapDocument
  | { content: Array<TipTapNode> }
  | { type: string; content: any[] }
  | string;

/**
 * Options for comment editor
 */
export interface CommentEditorOptions {
  placeholder?: string;
  isReadOnly?: boolean;
  debug?: boolean;
}

/**
 * Result of a comment operation
 */
export interface CommentOperationResult {
  success: boolean;
  comment?: Comment;
  error?: string;
}
