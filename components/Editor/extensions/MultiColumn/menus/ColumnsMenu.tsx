import { useEditorState } from '@tiptap/react';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';

import { MenuProps } from '@/components/Editor/components/menus/types';
import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import { ColumnLayout } from '../Columns';
import { Icon } from '@/components/Editor/components/ui/Icon';

// Must be referentially stable: BubbleMenu dispatches an editor transaction
// whenever `options` changes identity, so an inline literal would loop.
const BUBBLE_MENU_OPTIONS = {
  offset: 8,
  flip: false,
} as const;

export const ColumnsMenu = ({ editor }: MenuProps) => {
  const shouldShow = useCallback(() => {
    const isColumns = editor.isActive('columns');
    return isColumns;
  }, [editor]);

  const onColumnLeft = useCallback(() => {
    editor.chain().focus().setLayout(ColumnLayout.SidebarLeft).run();
  }, [editor]);

  const onColumnRight = useCallback(() => {
    editor.chain().focus().setLayout(ColumnLayout.SidebarRight).run();
  }, [editor]);

  const onColumnTwo = useCallback(() => {
    editor.chain().focus().setLayout(ColumnLayout.TwoColumn).run();
  }, [editor]);
  const { isColumnLeft, isColumnRight, isColumnTwo } = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isColumnLeft: ctx.editor.isActive('columns', { layout: ColumnLayout.SidebarLeft }),
        isColumnRight: ctx.editor.isActive('columns', { layout: ColumnLayout.SidebarRight }),
        isColumnTwo: ctx.editor.isActive('columns', { layout: ColumnLayout.TwoColumn }),
      };
    },
  });

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey={`columnsMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      options={BUBBLE_MENU_OPTIONS}
    >
      <Toolbar.Wrapper>
        <Toolbar.Button tooltip="Sidebar left" active={isColumnLeft} onClick={onColumnLeft}>
          <Icon name="PanelLeft" />
        </Toolbar.Button>
        <Toolbar.Button tooltip="Two columns" active={isColumnTwo} onClick={onColumnTwo}>
          <Icon name="Columns2" />
        </Toolbar.Button>
        <Toolbar.Button tooltip="Sidebar right" active={isColumnRight} onClick={onColumnRight}>
          <Icon name="PanelRight" />
        </Toolbar.Button>
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
};

export default ColumnsMenu;
