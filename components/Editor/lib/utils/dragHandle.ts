import type { Editor } from '@tiptap/core';

/** Transaction meta the drag handle plugin reads to hide the handle for one cycle. */
export const DRAG_HANDLE_HIDE_META = 'hideDragHandle';

/** Transaction meta that makes the drag handle plugin ignore mouse movement. */
export const DRAG_HANDLE_LOCK_META = 'lockDragHandle';

type SuppressOptions = {
  /**
   * Also hide the handle. Menus anchored to the handle itself (the grip
   * dropdown) must leave it on screen or they lose their trigger; menus that
   * float elsewhere (the slash menu) should hide it.
   */
  hide?: boolean;
};

/**
 * Keeps the drag handle out of the way while a menu it opened is on screen.
 *
 * Hiding alone is not enough: the handle re-reveals itself on the next mouse
 * move, which lets its "+" open a second menu on top of the first. Locking
 * makes the plugin ignore mouse movement entirely. The hide must be dispatched
 * before the lock, because the plugin's `hideDragHandle` branch also clears its
 * lock flag.
 */
export const setDragHandleSuppressed = (
  editor: Editor,
  suppressed: boolean,
  { hide = false }: SuppressOptions = {}
) => {
  if (editor.isDestroyed) return;

  if (suppressed && hide) {
    editor.commands.setMeta(DRAG_HANDLE_HIDE_META, true);
  }

  editor.commands.setMeta(DRAG_HANDLE_LOCK_META, suppressed);
};
