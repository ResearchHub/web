import { Icon } from '@/components/Editor/components/ui/Icon';
import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import DragHandle from '@tiptap-pro/extension-drag-handle-react';
import { Editor } from '@tiptap/react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Surface } from '@/components/Editor/components/ui/Surface';
import { DropdownButton } from '@/components/Editor/components/ui/Dropdown';
import { ChevronRight } from 'lucide-react';
import GROUPS from '@/components/Editor/extensions/SlashCommand/groups';
import { Command } from '@/components/Editor/extensions/SlashCommand/types';
import useContentItemActions from './hooks/useContentItemActions';
import { useData } from './hooks/useData';
import { Fragment, useEffect, useMemo, useState } from 'react';

export type ContentItemMenuProps = {
  editor: Editor;
};

export const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const data = useData();
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos);

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta('lockDragHandle', true);
    } else {
      editor.commands.setMeta('lockDragHandle', false);
    }
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
      tippyOptions={{
        offset: [-2, 16],
        zIndex: 99,
      }}
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
