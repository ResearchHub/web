import { ReactNode } from 'react';
import { Work, ContentType } from '@/types/work';

/**
 * Common interface for author data across different content types
 */
export interface AuthorData {
  id?: string | number;
  fullName: string;
  profileImage?: string | null;
  profileUrl?: string;
  isVerified?: boolean;
}

/**
 * Options that can be passed to renderers
 */
export interface RenderOptions {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showActions?: boolean;
  isDetailed?: boolean;
  target?: any;
  context?: any;
  metrics?: any;
  expiringSoon?: boolean;
  onContribute?: () => void;
  onViewSolution?: (solutionId: any, authorName: string, awardedAmount?: string) => void;
  onNavigationClick?: (tab: 'reviews' | 'conversation') => void;
  onAward?: (id: number) => void;

  // Footer action callbacks
  onUpvote?: (id: number) => void;
  onReply?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
  onReport?: (id: number) => void;
  isAuthor?: boolean;
}

/**
 * Options for rendering related papers
 */
export interface RelatedPaperOptions {
  onClick?: () => void;
}

/**
 * Interface for content renderers
 * Each content type should implement this interface
 */
export interface ContentRenderer<T = any> {
  /**
   * Render the header (author, timestamp, etc.)
   */
  renderHeader: (content: T, options?: RenderOptions) => ReactNode;

  /**
   * Render the body (main content)
   */
  renderBody: (content: T, options?: RenderOptions) => ReactNode;

  /**
   * Render content-specific actions that appear within the body
   * (e.g., "Contribute", "Submit Solution" for bounties)
   */
  renderContentActions: (content: T, options?: RenderOptions) => ReactNode;

  /**
   * Render footer actions that appear at the bottom of every card
   * (e.g., "Upvote", "Reply", "Share" for all content types)
   */
  renderFooterActions: (content: T, options?: RenderOptions) => ReactNode;

  /**
   * Get URL for the content
   */
  getUrl: (content: T) => string;

  /**
   * Extract author data from content
   */
  getAuthorData: (content: T) => AuthorData | AuthorData[];

  /**
   * Get content-specific metadata
   */
  getMetadata: (content: T) => Record<string, any>;
}

/**
 * Registry of content renderers
 */
export interface ContentRendererRegistry {
  [key: string]: ContentRenderer;
}
