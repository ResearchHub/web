import { ReactRenderer } from '@tiptap/react';
import { Mention } from '@tiptap/extension-mention';
import { UserMention } from '@/types/comment';
import { SearchService } from '@/services/search.service';
import { SearchSuggestion, UserSuggestion, WorkSuggestion } from '@/types/search';
import { MentionList } from './MentionList';
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './mention.css';
import { DOMOutputSpec } from 'prosemirror-model';

interface MentionItem {
  id: string;
  label: string;
  entityType: 'user' | 'work';
  authorProfileId?: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  authors?: string[];
}

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

const transformSuggestionToMentionItem = (suggestion: SearchSuggestion): MentionItem => {
  console.log('[Transform] Input suggestion:', suggestion);
  if (suggestion.entityType === 'user') {
    const userSuggestion = suggestion as UserSuggestion;
    const result: MentionItem = {
      id: userSuggestion.id?.toString() || `user-${Date.now()}`,
      entityType: 'user' as const,
      firstName: userSuggestion.fullName.split(' ')[0],
      lastName: userSuggestion.fullName.split(' ').slice(1).join(' '),
      label: userSuggestion.fullName,
      authorProfileId: userSuggestion.id?.toString() || null,
    };
    console.log('[Transform] Created user mention item:', result);
    return result;
  } else {
    const workSuggestion = suggestion as WorkSuggestion;
    console.log('[Transform] Work suggestion displayName:', workSuggestion.displayName);
    const mentionItem: MentionItem = {
      id: workSuggestion.doi,
      entityType: 'work' as const,
      displayName: workSuggestion.displayName,
      authors: workSuggestion.authors,
      label: workSuggestion.displayName,
    };
    console.log('[Transform] Created work mention item:', mentionItem);
    return mentionItem;
  }
};

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionExtension = Mention.configure({
  HTMLAttributes: {
    class: 'mention',
  },
  renderText({ node }) {
    console.log('[renderText] Input node:', node);
    // For work mentions, we want to show the full title without @ symbol
    if (node.attrs.entityType === 'work') {
      const result = node.attrs.displayName || node.attrs.label;
      console.log('[renderText] Work mention result:', result);
      return result;
    }
    // For users, keep the @ symbol
    const result = `@${node.attrs.label}`;
    console.log('[renderText] User mention result:', result);
    return result;
  },
  renderHTML({ node }): DOMOutputSpec {
    console.log('[renderHTML] Input node:', node);
    if (node.attrs.entityType === 'work') {
      return [
        'span',
        {
          'data-type': 'mention',
          'data-id': node.attrs.id,
          'data-entity-type': node.attrs.entityType,
          class: `mention mention-${node.attrs.entityType}`,
        },
        [
          'span',
          { class: 'mention-icon' },
          '', // Paper icon will be added via CSS
        ] as DOMOutputSpec,
        [
          'span',
          { class: 'mention-label' },
          node.attrs.displayName || node.attrs.label,
        ] as DOMOutputSpec,
      ] as DOMOutputSpec;
    }

    // Default user mention rendering
    return [
      'span',
      {
        'data-type': 'mention',
        'data-id': node.attrs.id,
        'data-entity-type': node.attrs.entityType,
        class: `mention mention-${node.attrs.entityType}`,
      },
      `@${node.attrs.label}`,
    ] as DOMOutputSpec;
  },
  suggestion: {
    char: '@',
    allowSpaces: true,
    items: async ({ query }) => {
      return debouncedSearch(query || '');
    },
    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: Instance<Props> | null = null;

      return {
        onStart: (props) => {
          console.log('Render onStart props:', props);
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
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            animation: 'scale-subtle',
            duration: 150,
            theme: 'mention',
          });

          // Add tooltip when @ is pressed with no query
          if (!props.query) {
            popup.setProps({
              content: `<div class="p-2 text-sm text-gray-600">Mention a user or paper...</div>`,
            });
          }

          popup.show();
        },

        onUpdate: (props) => {
          console.log('Render onUpdate props:', props);
          component?.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });

          // Update tooltip content based on query
          if (!props.query && popup) {
            popup.setProps({
              content: `<div class="p-2 text-sm text-gray-600">Mention a user or paper...</div>`,
            });
          } else if (component) {
            popup?.setProps({
              content: component.element,
            });
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
      console.log('[command] Input item:', item);
      const attrs = {
        id: item.id,
        label: item.label,
        entityType: item.entityType,
        displayName: item.displayName,
      };
      console.log('[command] Attrs being inserted:', attrs);
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
