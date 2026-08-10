import { Icon } from '@/components/Editor/components/ui/Icon';
import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import DragHandle from '@tiptap/extension-drag-handle-react';
import { Editor } from '@tiptap/react';
import type { Transaction } from '@tiptap/pm/state';
import { offset } from '@floating-ui/dom';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Surface } from '@/components/Editor/components/ui/Surface';
import { DropdownButton } from '@/components/Editor/components/ui/Dropdown';
import { ChevronRight } from 'lucide-react';
import GROUPS from '@/components/Editor/extensions/SlashCommand/groups';
import { Command } from '@/components/Editor/extensions/SlashCommand/types';
import useContentItemActions from './hooks/useContentItemActions';
import { useData } from './hooks/useData';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  DRAG_HANDLE_LOCK_META,
  setDragHandleSuppressed,
} from '@/components/Editor/lib/utils/dragHandle';

export type ContentItemMenuProps = {
  editor: Editor;
};

/** Width of the paper's left gutter (`pl-16` on NotePaper) that hosts the handle. */
const GUTTER_WIDTH = 64;

export const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const data = useData();
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos);

  // DragHandle re-registers its ProseMirror plugin whenever this object's
  // identity changes, which tears down every plugin view in the editor (and so
  // closes any open suggestion popup). It must stay referentially stable.
  const dragHandleConfig = useMemo(
    () => ({
      placement: 'left-start' as const,
      // Mirrors the v2 tippy offset of [skidding: -2, distance: 16].
      middleware: [offset({ mainAxis: 16, crossAxis: -2 })],
    }),
    []
  );

  // The handle renders in the paper's left gutter, which belongs to the page
  // card rather than to ProseMirror, and the drag handle plugin only listens
  // for mousemove on the editor's own element. Two consequences are handled
  // here: the handle cannot follow the cursor while it is out in the gutter,
  // and it never reappears after being released unless the cursor happens to
  // move onto a different block.
  useEffect(() => {
    const dom = editor.view?.dom as HTMLElement | undefined;
    if (!dom) return;

    const pointer = { x: 0, y: 0, known: false };
    let frame = 0;

    // The plugin only reveals the handle while handling a mousemove, so when it
    // needs re-evaluating without the user moving the mouse, replay the last
    // known pointer position at it. Dispatched non-bubbling so it cannot
    // re-enter the document listener below. The plugin clamps the x coordinate
    // back inside the content box, so gutter positions resolve to their block.
    const replayPointer = () => {
      if (!pointer.known || editor.isDestroyed) return;

      const rect = dom.getBoundingClientRect();
      const besideEditor =
        pointer.x >= rect.left - GUTTER_WIDTH &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom;

      if (!besideEditor) return;

      dom.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: pointer.x,
          clientY: pointer.y,
          bubbles: false,
        })
      );
    };

    const onPointerMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.known = true;
      // Ignore drags so we never interfere with an in-progress selection.
      if (event.buttons !== 0 || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // Moves over the editor itself already reach the plugin natively.
        if (pointer.x >= dom.getBoundingClientRect().left) return;
        replayPointer();
      });
    };

    // Releasing the handle leaves it hidden with no tracked node, so bring it
    // back where the cursor already is rather than waiting for a mouse move.
    const onTransaction = ({ transaction }: { transaction: Transaction }) => {
      if (transaction.getMeta(DRAG_HANDLE_LOCK_META) === false) {
        replayPointer();
      }
    };

    document.addEventListener('mousemove', onPointerMove);
    editor.on('transaction', onTransaction);
    return () => {
      document.removeEventListener('mousemove', onPointerMove);
      editor.off('transaction', onTransaction);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [editor]);

  // The dropdown is anchored to the grip button, so the handle stays visible
  // and is only locked in place for as long as the menu is open.
  useEffect(() => {
    setDragHandleSuppressed(editor, menuOpen);
  }, [editor, menuOpen]);

  // Filter the shared slash-command GROUPS down to the items that make
  // sense inside the "Turn into" submenu. Recomputed when the menu opens
  // so `shouldBeHidden(editor)` reflects the current editor state (e.g.
  // hide code block when the cursor is inside a columns layout).
  const turnIntoGroups = useMemo(() => {
    if (!menuOpen) return [];
    return GROUPS.map((group) => ({
      ...group,
      commands: group.commands.filter((command) => {
        if (command.hideFromTurnInto) return false;
        if (command.shouldBeHidden?.(editor)) return false;
        return true;
      }),
    })).filter((group) => group.commands.length > 0);
  }, [editor, menuOpen]);

  return (
    <DragHandle
      pluginKey="ContentItemMenu"
      editor={editor}
      onNodeChange={data.handleNodeChange}
      className="z-[99]"
      computePositionConfig={dragHandleConfig}
    >
      <div className="flex items-center gap-0.5">
        <Toolbar.Button onClick={actions.handleAdd}>
          <Icon name="Plus" />
        </Toolbar.Button>
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
          <DropdownMenu.Trigger asChild>
            <Toolbar.Button>
              <Icon name="GripVertical" />
            </Toolbar.Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="bottom" align="start" sideOffset={8}>
              <Surface className="p-2 flex flex-col min-w-[16rem]">
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger asChild>
                    <DropdownButton>
                      <Icon name="RefreshCw" />
                      <span className="flex-1">Turn into</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </DropdownButton>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent sideOffset={4} alignOffset={-8}>
                      <Surface className="p-2 flex flex-col min-w-[16rem] max-h-[min(80vh,24rem)] overflow-auto">
                        {turnIntoGroups.map((group) => (
                          <Fragment key={group.name}>
                            <div className="text-neutral-500 text-[0.65rem] mx-2 mt-4 mb-1 font-semibold tracking-wider select-none uppercase first:mt-0">
                              {group.title}
                            </div>
                            {group.commands.map((command: Command) => (
                              <DropdownMenu.Item
                                key={command.name}
                                asChild
                                onSelect={() => actions.turnInto(command)}
                              >
                                <DropdownButton>
                                  <Icon name={command.iconName} />
                                  {command.label}
                                </DropdownButton>
                              </DropdownMenu.Item>
                            ))}
                          </Fragment>
                        ))}
                      </Surface>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
                <DropdownMenu.Item asChild onSelect={actions.resetTextFormatting}>
                  <DropdownButton>
                    <Icon name="RemoveFormatting" />
                    Clear formatting
                  </DropdownButton>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild onSelect={actions.copyNodeToClipboard}>
                  <DropdownButton>
                    <Icon name="Clipboard" />
                    Copy to clipboard
                  </DropdownButton>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild onSelect={actions.duplicateNode}>
                  <DropdownButton>
                    <Icon name="Copy" />
                    Duplicate
                  </DropdownButton>
                </DropdownMenu.Item>
                <Toolbar.Divider horizontal />
                <DropdownMenu.Item asChild onSelect={actions.deleteNode}>
                  <DropdownButton className="text-red-500 bg-red-500 dark:text-red-500 hover:bg-red-500 dark:hover:text-red-500 dark:hover:bg-red-500 bg-opacity-10 hover:bg-opacity-20 dark:hover:bg-opacity-20">
                    <Icon name="Trash2" />
                    Delete
                  </DropdownButton>
                </DropdownMenu.Item>
              </Surface>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </DragHandle>
  );
};
