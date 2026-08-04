import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import React, { useCallback } from 'react';
import * as PopoverMenu from '@/components/Editor/components/ui/PopoverMenu';

import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import { isRowGripSelected } from './utils';
import { Icon } from '@/components/Editor/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/Editor/components/menus/types';

// Must be referentially stable: BubbleMenu dispatches an editor transaction
// whenever `options` changes identity, so an inline literal would loop.
const BUBBLE_MENU_OPTIONS = {
  placement: 'left',
  offset: 15,
  flip: false,
} as const;

export const TableRowMenu = React.memo(({ editor }: MenuProps): React.JSX.Element => {
  const shouldShow = useCallback(
    ({ view, state, from }: ShouldShowProps) => {
      if (!state || !from) {
        return false;
      }

      return isRowGripSelected({ editor, view, state, from });
    },
    [editor]
  );

  const onAddRowBefore = useCallback(() => {
    editor.chain().focus().addRowBefore().run();
  }, [editor]);

  const onAddRowAfter = useCallback(() => {
    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const onDeleteRow = useCallback(() => {
    editor.chain().focus().deleteRow().run();
  }, [editor]);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableRowMenu"
      updateDelay={0}
      options={BUBBLE_MENU_OPTIONS}
      shouldShow={shouldShow}
    >
      <Toolbar.Wrapper isVertical>
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowUpToLine" />}
          close={false}
          label="Add row before"
          onClick={onAddRowBefore}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowDownToLine" />}
          close={false}
          label="Add row after"
          onClick={onAddRowAfter}
        />
        <PopoverMenu.Item icon="Trash" close={false} label="Delete row" onClick={onDeleteRow} />
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
});

TableRowMenu.displayName = 'TableRowMenu';

export default TableRowMenu;
