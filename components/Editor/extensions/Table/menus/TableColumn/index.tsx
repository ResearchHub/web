import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import React, { useCallback, useMemo } from 'react';
import * as PopoverMenu from '@/components/Editor/components/ui/PopoverMenu';

import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import { isColumnGripSelected } from './utils';
import { Icon } from '@/components/Editor/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/Editor/components/menus/types';

export const TableColumnMenu = React.memo(({ editor, appendTo }: MenuProps): React.JSX.Element => {
  const shouldShow = useCallback(
    ({ view, state, from }: ShouldShowProps) => {
      if (!state) {
        return false;
      }

      return isColumnGripSelected({ editor, view, state, from: from || 0 });
    },
    [editor]
  );

  const onAddColumnBefore = useCallback(() => {
    editor.chain().focus().addColumnBefore().run();
  }, [editor]);

  const onAddColumnAfter = useCallback(() => {
    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  const onDeleteColumn = useCallback(() => {
    editor.chain().focus().deleteColumn().run();
  }, [editor]);

  // Stable identities required: BubbleMenu dispatches a transaction whenever
  // these props change, which would re-render this menu and loop.
  const menuAppendTo = useCallback(() => appendTo?.current, [appendTo]);
  const menuOptions = useMemo(() => ({ offset: 15, flip: false }), []);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableColumnMenu"
      updateDelay={0}
      appendTo={menuAppendTo}
      options={menuOptions}
      shouldShow={shouldShow}
    >
      <Toolbar.Wrapper isVertical>
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowLeftToLine" />}
          close={false}
          label="Add column before"
          onClick={onAddColumnBefore}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowRightToLine" />}
          close={false}
          label="Add column after"
          onClick={onAddColumnAfter}
        />
        <PopoverMenu.Item
          icon="Trash"
          close={false}
          label="Delete column"
          onClick={onDeleteColumn}
        />
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
});

TableColumnMenu.displayName = 'TableColumnMenu';

export default TableColumnMenu;
