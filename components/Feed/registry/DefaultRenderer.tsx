import { FC } from 'react';
import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Button } from '@/components/ui/Button';

/**
 * Default renderer for unknown content types
 */
export const DefaultRenderer: ContentRenderer = {
  renderHeader: (content, options = {}) => {
    const authorData = DefaultRenderer.getAuthorData(content);
    const metadata = DefaultRenderer.getMetadata(content);

    return (
      <FeedItemHeader
        contentType={content.type || 'unknown'}
        timestamp={content.timestamp || new Date().toISOString()}
        author={Array.isArray(authorData) ? authorData[0] : authorData}
        authors={Array.isArray(authorData) ? authorData : undefined}
      />
    );
  },

  renderBody: (content, options = {}) => {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          {content.title || 'Untitled Content'}
        </h3>
        <p className="text-sm text-gray-700">
          {content.summary || content.abstract || 'No content available'}
        </p>
      </div>
    );
  },

  /**
   * Render content-specific actions that appear within the body
   */
  renderContentActions: (content, options = {}) => {
    // Default renderer doesn't have content-specific actions
    return null;
  },

  /**
   * Render footer actions that appear at the bottom of every card
   */
  renderFooterActions: (content, options = {}) => {
    // Return null as we've moved all functionality to renderContentActions
    return null;
  },

  getUrl: (content) => {
    return `/${content.type || 'content'}/${content.id}/${content.slug || 'details'}`;
  },

  getAuthorData: (content): AuthorData => {
    // Try to extract author data from common patterns
    if (content.author) {
      return {
        id: content.author.id || 'unknown',
        fullName: content.author.fullName || content.author.name || 'Unknown User',
        profileImage: content.author.profileImage || content.author.avatar || null,
        profileUrl: content.author.profileUrl || '#',
        isVerified: content.author.isVerified || false,
      };
    }

    if (content.user) {
      return {
        id: content.user.id || 'unknown',
        fullName: content.user.fullName || content.user.name || 'Unknown User',
        profileImage: content.user.profileImage || content.user.avatar || null,
        profileUrl: content.user.profileUrl || '#',
        isVerified: content.user.isVerified || false,
      };
    }

    // Fallback to a default author
    return {
      id: 'unknown',
      fullName: 'Unknown User',
      profileImage: null,
      profileUrl: '#',
      isVerified: false,
    };
  },

  getMetadata: (content) => {
    return {
      type: content.type || 'unknown',
      timestamp: content.timestamp || new Date().toISOString(),
    };
  },
};
