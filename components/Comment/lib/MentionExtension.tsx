import { ReactRenderer } from '@tiptap/react';
import { Mention } from '@tiptap/extension-mention';
import { UserMention } from '@/types/comment';
import { SearchService } from '@/services/search.service';
import { SearchSuggestion, UserSuggestion, WorkSuggestion, PostSuggestion } from '@/types/search';
import { MentionList } from './MentionList';
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './mention.css';
import { DOMOutputSpec } from 'prosemirror-model';
import { MentionItem, MentionListRef } from './types';
import { buildWorkUrl } from '@/utils/url';
import { buildAuthorUrl } from '@/utils/url';

// Create a debounced search function
const createDebouncedSearch = () => {
  let timeoutId: NodeJS.Timeout | null = null;
  let currentPromiseResolve: ((items: MentionItem[]) => void) | null = null;

  const search = (query: string): Promise<MentionItem[]> => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // If there's a pending promise, resolve it with empty results
    if (currentPromiseResolve) {
      currentPromiseResolve([]);
      currentPromiseResolve = null;
    }

    // Return a new promise
    return new Promise((resolve) => {
      currentPromiseResolve = resolve;

      timeoutId = setTimeout(async () => {
        if (!query || query.length < 2) {
          resolve([]);
          return;
        }

        try {
          const suggestions = await SearchService.getSuggestions(query, ['user', 'paper']);
          const items = suggestions.map(transformSuggestionToMentionItem);
          resolve(items);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          resolve([]);
        }
      }, 300); // 300ms debounce
    });
  };

  return search;
};

const debouncedSearch = createDebouncedSearch();

const transformUserSuggestion = (userSuggestion: UserSuggestion): MentionItem => {
  const nameParts = userSuggestion.displayName.split(' ');
  return {
    id: userSuggestion.id?.toString() || null,
    entityType: userSuggestion.entityType,
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(' '),
    label: userSuggestion.displayName,
    authorProfileId: userSuggestion.id?.toString() || null,
    isVerified: userSuggestion.isVerified || false,
    authorProfile: userSuggestion.authorProfile
      ? {
          headline:
            typeof userSuggestion.authorProfile.headline === 'string'
              ? userSuggestion.authorProfile.headline
              : userSuggestion.authorProfile.headline
                ? (userSuggestion.authorProfile.headline as { title: string }).title
                : '',
          profileImage: userSuggestion.authorProfile.profileImage || null,
        }
      : undefined,
  };
};

const transformPaperSuggestion = (paperSuggestion: WorkSuggestion): MentionItem => {
  return {
    id: paperSuggestion.id?.toString() || null,
    entityType: 'paper',
    displayName: paperSuggestion.displayName,
    authors: paperSuggestion.authors,
    label: paperSuggestion.displayName,
    doi: paperSuggestion.doi,
    citations: paperSuggestion.citations,
    source: paperSuggestion.source,
  };
};

const transformPostSuggestion = (postSuggestion: PostSuggestion): MentionItem => {
  return {
    id: postSuggestion.id.toString(),
    entityType: 'post',
    label: postSuggestion.displayName,
    displayName: postSuggestion.displayName,
  };
};

const transformSuggestionToMentionItem = (suggestion: SearchSuggestion): MentionItem => {
  if (suggestion.entityType === 'user' || suggestion.entityType === 'author') {
    return transformUserSuggestion(suggestion as UserSuggestion);
  } else if (suggestion.entityType === 'paper') {
    return transformPaperSuggestion(suggestion as WorkSuggestion);
  } else if (suggestion.entityType === 'post') {
    return transformPostSuggestion(suggestion as PostSuggestion);
  } else {
    throw new Error(`Unsupported entity type: ${suggestion.entityType}`);
  }
};

export const MentionExtension = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      entityType: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-entity-type'),
        renderHTML: (attributes: { entityType: string }) => ({
          'data-entity-type': attributes.entityType,
        }),
      },
      displayName: {
        default: null,
      },
      id: {
        default: null,
      },
      doi: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-doi'),
        renderHTML: (attributes: { doi?: string }) =>
          attributes.doi ? { 'data-doi': attributes.doi } : {},
      },
    };
  },
}).configure({
  HTMLAttributes: {
    class: 'mention',
  },
  renderText({ node }) {
    // For all mentions, just return the label
    return node.attrs.displayName || node.attrs.label;
  },
  renderHTML({ node }): DOMOutputSpec {
    // Paper mention rendering
    if (node.attrs.entityType === 'paper') {
      const url = buildWorkUrl({
        id: node.attrs.id,
        contentType: 'paper',
        doi: node.attrs.doi,
      });

      // If we got a fallback URL, render as a span instead of a link
      if (url === '#') {
        return [
          'span',
          {
            'data-type': 'mention',
            'data-id': node.attrs.id,
            'data-entity-type': 'paper',
            class: 'mention mention-paper',
            contenteditable: 'false',
          },
          node.attrs.displayName || node.attrs.label,
        ];
      }

      return [
        'a',
        {
          'data-type': 'mention',
          'data-id': node.attrs.id,
          'data-entity-type': 'paper',
          class: 'mention mention-paper',
          href: url,
          contenteditable: 'false',
        },
        node.attrs.displayName || node.attrs.label,
      ];
    }

    // User and author mention rendering
    if (node.attrs.entityType === 'user' || node.attrs.entityType === 'author') {
      // Only render as a link if we have an ID
      if (!node.attrs.id) {
        return [
          'span',
          {
            'data-type': 'mention',
            'data-entity-type': node.attrs.entityType,
            class: `mention mention-${node.attrs.entityType}`,
            contenteditable: 'false',
          },
          node.attrs.label,
        ];
      }

      const url = buildAuthorUrl(node.attrs.id);
      return [
        'a',
        {
          'data-type': 'mention',
          'data-id': node.attrs.id,
          'data-entity-type': node.attrs.entityType,
          class: `mention mention-${node.attrs.entityType}`,
          href: url,
          contenteditable: 'false',
        },
        node.attrs.label,
      ];
    }

    // Post mention rendering
    if (node.attrs.entityType === 'post') {
      // Only render as a link if we have an ID
      if (!node.attrs.id) {
        return [
          'span',
          {
            'data-type': 'mention',
            'data-entity-type': 'post',
            class: 'mention mention-post',
            contenteditable: 'false',
          },
          node.attrs.label,
        ];
      }

      const url = buildWorkUrl({
        id: node.attrs.id,
        contentType: 'post',
      });
      return [
        'a',
        {
          'data-type': 'mention',
          'data-id': node.attrs.id,
          'data-entity-type': 'post',
          class: 'mention mention-post',
          href: url,
          contenteditable: 'false',
        },
        node.attrs.label,
      ];
    }

    // Default rendering for other types
    return [
      'span',
      {
        'data-type': 'mention',
        'data-id': node.attrs.id,
        'data-entity-type': node.attrs.entityType,
        class: `mention mention-${node.attrs.entityType}`,
        contenteditable: 'false',
      },
      node.attrs.label,
    ];
  },
  suggestion: {
    char: '@',
    allowSpaces: true,
    decorationTag: 'span',
    decorationClass: 'mention-suggestion',
    items: async ({ query }) => {
      const items = await debouncedSearch(query || '');
      return items;
    },
    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: Instance<Props> | null = null;

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          const element = document.createElement('div');
          element.appendChild(component.element);

          const reference = document.createElement('div');
          document.body.appendChild(reference);

          popup = tippy(reference, {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: element,
            showOnCreate: false,
            interactive: true,
            trigger: 'manual',
            placement: 'right-end',
            animation: false,
            theme: 'mention',
            maxWidth: '400px',
            offset: [8, 6],
            popperOptions: {
              modifiers: [
                {
                  name: 'flip',
                  enabled: false,
                },
                {
                  name: 'preventOverflow',
                  options: {
                    altAxis: true,
                    padding: 5,
                  },
                },
              ],
            },
          });

          // Add inline placeholder when @ is pressed with no query
          if (!props.query) {
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'mention-placeholder';
            placeholderDiv.textContent = 'Mention a work or person';
            popup.setProps({
              content: placeholderDiv,
            });
            popup.show();
          }
        },

        onUpdate: (props) => {
          component?.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });

          // Show placeholder if query is empty
          if (!props.query) {
            if (popup) {
              const placeholderDiv = document.createElement('div');
              placeholderDiv.className = 'mention-placeholder';
              placeholderDiv.textContent = 'Mention a work or person';
              popup.setProps({
                content: placeholderDiv,
              });
              popup.show();
            }
            return;
          }

          // with a query, show list if there are items, otherwise hide.
          if (props.items.length > 0) {
            if (component) {
              popup?.setProps({
                content: component.element,
              });
            }
            popup?.show();
          } else {
            popup?.hide();
          }
        },

        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            popup?.hide();
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit: () => {
          popup?.destroy();
          component?.destroy();
        },
      };
    },
    command: ({ editor, range, props: commandProps }) => {
      const item = commandProps as MentionItem;
      const attrs: any = {
        id: item.id,
        label: item.label,
        entityType: item.entityType,
        displayName: item.displayName || item.label,
      };

      // Add DOI for paper mentions if available
      if (item.entityType === 'paper' && item.doi) {
        attrs.doi = item.doi;
      }

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'mention',
            attrs,
          },
        ])
        .run();
    },
  },
});
