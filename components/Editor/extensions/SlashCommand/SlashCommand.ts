import { Editor, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, {
  SuggestionProps,
  SuggestionKeyDownProps,
  exitSuggestion,
} from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import tippy, { Instance as TippyInstance } from 'tippy.js';

import { GROUPS } from './groups';
import { MenuList } from './MenuList';
import { setDragHandleSuppressed } from '@/components/Editor/lib/utils/dragHandle';

const extensionName = 'slashCommand';

// Held at module scope so `exitSuggestion` can address this plugin. The key is
// shared across editors, which is fine: each editor gets its own plugin
// instance and its own state under that key.
const slashCommandPluginKey = new PluginKey(extensionName);

/** Gap kept between the menu and the bottom of the viewport, in px. */
const VIEWPORT_MARGIN = 40;

/**
 * Structural stand-in for `DOMRect`, whose constructor does not exist while
 * extensions are instantiated on the server.
 */
type MenuRect = Omit<DOMRect, 'toJSON'> & { toJSON: () => unknown };

const createEmptyRect = (): MenuRect => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  toJSON: () => ({}),
});

export interface SlashCommandStorage {
  /** Last known caret rect, used as a fallback while the suggestion has none. */
  rect: DOMRect | MenuRect;
  /**
   * Set by the drag handle's "+" button, which opens this menu by typing a `/`
   * into the document on the user's behalf. It marks that slash as ours to undo
   * if the menu is dismissed without picking a command, so an abandoned click
   * doesn't leave a stray `/` behind. A slash the user typed themselves has no
   * marker and is always left alone.
   */
  pendingAutoInsert: { createdParagraph: boolean } | null;
  /** Owned per editor so remounting the editor cannot leak orphan popups. */
  popup: TippyInstance | null;
}

// v3 types `editor.storage` against a declared interface rather than an index
// signature, so the extension has to register its own storage key.
declare module '@tiptap/core' {
  interface Storage {
    slashCommand: SlashCommandStorage;
  }
}

/**
 * Anchors the menu to the caret, nudged upwards when it would otherwise open
 * past the bottom of the viewport. Falls back to the last known caret rect
 * while the suggestion reports none of its own.
 */
const createReferenceRectGetter = (props: SuggestionProps, getMenuHeight: () => number) => () => {
  const rect = props.clientRect?.();

  if (!rect) {
    return props.editor.storage[extensionName].rect;
  }

  const overflow = rect.top + getMenuHeight() + VIEWPORT_MARGIN - window.innerHeight;
  const y = overflow > 0 ? rect.y - overflow : rect.y;

  return new DOMRect(rect.x, y, rect.width, rect.height);
};

export const SlashCommand = Extension.create({
  name: extensionName,

  priority: 200,

  onCreate() {
    this.storage.popup =
      tippy('body', {
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        theme: 'slash-command',
        maxWidth: '16rem',
        offset: [16, 8],
        popperOptions: {
          strategy: 'fixed',
          modifiers: [
            {
              name: 'flip',
              enabled: false,
            },
          ],
        },
      })[0] ?? null;
  },

  onDestroy() {
    this.storage.popup?.destroy();
    this.storage.popup = null;
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: true,
        startOfLine: true,
        pluginKey: slashCommandPluginKey,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const isRootDepth = $from.depth === 1;
          const isParagraph = $from.parent.type.name === 'paragraph';
          const isStartOfNode = $from.parent.textContent?.charAt(0) === '/';
          // TODO
          const isInColumn = this.editor.isActive('column');

          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent?.indexOf('/')
          );
          const isValidAfterContent = !afterContent?.endsWith('  ');

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          );
        },
        command: ({ editor, props }: { editor: Editor; props: any }) => {
          // A command was chosen, so the inserted `/` has served its purpose and
          // is consumed by the range deletion below rather than rolled back.
          editor.storage[extensionName].pendingAutoInsert = null;

          const { view, state } = editor;
          const { $head, $from } = view.state.selection;

          const end = $from.pos;
          const from = $head?.nodeBefore
            ? end -
              ($head.nodeBefore.text?.substring($head.nodeBefore.text?.indexOf('/')).length ?? 0)
            : $from.start();

          const tr = state.tr.deleteRange(from, end);
          view.dispatch(tr);

          props.action(editor);
          view.focus();
        },
        items: ({ query }: { query: string }) => {
          const queryNormalized = query.toLowerCase().trim();

          return GROUPS.map((group) => ({
            ...group,
            commands: group.commands
              .filter((item) => {
                if (item.shouldBeHidden?.(this.editor)) return false;

                const labelNormalized = item.label.toLowerCase().trim();
                const aliases = item.aliases?.map((alias) => alias.toLowerCase().trim());

                return aliases
                  ? labelNormalized.includes(queryNormalized) || aliases.includes(queryNormalized)
                  : labelNormalized.includes(queryNormalized);
              })
              .map((command) => ({ ...command, isEnabled: true })),
          })).filter((group) => group.commands.length > 0);
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let getReferenceClientRect: (() => DOMRect | MenuRect) | null = null;
          let scrollContainer: HTMLElement | null = null;
          let scrollHandler: (() => void) | null = null;
          let dismissOnOutsideClick: ((event: MouseEvent) => void) | null = null;

          // The handlers below are method shorthands with their own `this`, so
          // the editor is captured here in the arrow-function scope instead.
          const editor = this.editor;
          const getPopup = () => editor.storage[extensionName].popup;

          const stopWatchingOutsideClicks = () => {
            if (!dismissOnOutsideClick) return;
            document.removeEventListener('mousedown', dismissOnOutsideClick, true);
            dismissOnOutsideClick = null;
          };

          // Clicking outside the editor hides the popup via tippy but never
          // reaches ProseMirror, so the suggestion would stay active with no
          // menu on screen, leaving the drag handle locked and the inserted `/`
          // behind. Close the session explicitly instead.
          const watchOutsideClicks = () => {
            stopWatchingOutsideClicks();

            dismissOnOutsideClick = (event: MouseEvent) => {
              if (editor.isDestroyed) {
                stopWatchingOutsideClicks();
                return;
              }

              const target = event.target as Node | null;
              if (!target) return;

              // The menu handles its own clicks, and clicks inside the editor
              // already end the session by moving the selection.
              if (getPopup()?.popper.contains(target) || editor.view.dom.contains(target)) {
                return;
              }

              exitSuggestion(editor.view, slashCommandPluginKey);
            };

            document.addEventListener('mousedown', dismissOnOutsideClick, true);
          };

          const stopTrackingScroll = () => {
            if (!scrollHandler) return;
            scrollContainer?.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
            scrollContainer = null;
          };

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(MenuList, {
                props,
                editor: props.editor,
              });

              getReferenceClientRect = createReferenceRectGetter(
                props,
                () => (component?.element as HTMLElement | undefined)?.offsetHeight ?? 0
              );

              // Reads the latest getter on each scroll, so `onUpdate` can swap
              // it in without re-registering a listener.
              scrollContainer = props.editor.view.dom.parentElement;
              scrollHandler = () => getPopup()?.setProps({ getReferenceClientRect });
              scrollContainer?.addEventListener('scroll', scrollHandler);

              getPopup()?.setProps({
                getReferenceClientRect,
                appendTo: () => document.body,
                content: component.element,
              });
              getPopup()?.show();

              // Deferred: ProseMirror forbids dispatching while it is updating
              // plugin views, which is the context this runs in.
              queueMicrotask(() => setDragHandleSuppressed(props.editor, true, { hide: true }));

              watchOutsideClicks();
            },

            onUpdate(props: SuggestionProps) {
              component?.updateProps(props);

              getReferenceClientRect = createReferenceRectGetter(
                props,
                () => (component?.element as HTMLElement | undefined)?.offsetHeight ?? 0
              );

              // eslint-disable-next-line no-param-reassign
              props.editor.storage[extensionName].rect = props.clientRect
                ? getReferenceClientRect()
                : createEmptyRect();

              getPopup()?.setProps({ getReferenceClientRect });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              const popup = getPopup();

              if (props.event.key === 'Escape') {
                popup?.hide();
                // Escape only hides the popup; the suggestion stays active, so
                // release the handle here or it stays locked with no menu up.
                queueMicrotask(() => setDragHandleSuppressed(editor, false));

                return true;
              }

              if (!popup?.state.isShown) {
                popup?.show();
              }

              const menu = component?.ref as
                | { onKeyDown?: (p: SuggestionKeyDownProps) => boolean }
                | undefined;

              return menu?.onKeyDown?.(props) ?? false;
            },

            onExit(props) {
              getPopup()?.hide();
              stopWatchingOutsideClicks();
              stopTrackingScroll();
              component?.destroy();
              component = null;
              getReferenceClientRect = null;

              // Dismissed without choosing a command. If the "+" button opened
              // this menu, roll the document back to how it looked before the
              // click instead of leaving the inserted `/` behind.
              const { range } = props;
              const autoInsert = props.editor.storage[extensionName].pendingAutoInsert;
              props.editor.storage[extensionName].pendingAutoInsert = null;

              // ProseMirror forbids dispatching while it is updating plugin
              // views, which is where this runs, so apply on the next tick.
              queueMicrotask(() => {
                if (props.editor.isDestroyed) return;

                setDragHandleSuppressed(props.editor, false);

                if (!autoInsert) return;

                const { doc } = props.editor.state;
                if (range.from > doc.content.size) return;

                const $from = doc.resolve(range.from);
                // The "+" adds a whole paragraph unless it reused an empty one,
                // so remove the paragraph in that case to avoid a blank line.
                const target =
                  autoInsert.createdParagraph && $from.depth > 0
                    ? { from: $from.before($from.depth), to: $from.after($from.depth) }
                    : { from: range.from, to: Math.min(range.to, doc.content.size) };

                props.editor.chain().deleteRange(target).run();
              });
            },
          };
        },
      }),
    ];
  },

  addStorage(): SlashCommandStorage {
    return {
      rect: createEmptyRect(),
      pendingAutoInsert: null,
      popup: null,
    };
  },
});

export default SlashCommand;
