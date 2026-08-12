import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import React, { useCallback, useMemo } from 'react';
import * as PopoverMenu from '@/components/Editor/components/ui/PopoverMenu';

import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import { isRowGripSelected } from './utils';
import { Icon } from '@/components/Editor/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/Editor/components/menus/types';

export const TableRowMenu = React.memo(({ editor, appendTo }: MenuProps): React.JSX.Element => {
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

  // Stable identities required: BubbleMenu dispatches a transaction whenever
  // these props change, which would re-render this menu and loop.
  const menuAppendTo = useCallback(() => appendTo?.current, [appendTo]);
  const menuOptions = useMemo(() => ({ placement: 'left' as const, offset: 15, flip: false }), []);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableRowMenu"
      updateDelay={0}
      appendTo={menuAppendTo}
      options={menuOptions}
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
