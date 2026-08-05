import { useEditorState } from '@tiptap/react';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import React, { useCallback, useMemo, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import { Icon } from '@/components/Editor/components/ui/Icon';
import { ImageBlockWidth } from './ImageBlockWidth';
import { MenuProps } from '@/components/Editor/components/menus/types';
import { getRenderContainer } from '@/components/Editor/lib/utils';

export const ImageBlockMenu = ({ editor, appendTo }: MenuProps): React.JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);

  const getReferenceClientRect = useCallback(() => {
    const renderContainer = getRenderContainer(editor, 'node-imageBlock');
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0);

    return rect;
  }, [editor]);

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('imageBlock');

    return isActive;
  }, [editor]);

  // Stable identities required: BubbleMenu dispatches a transaction whenever
  // these props change, which would re-render this menu and loop.
  const menuAppendTo = useCallback(() => appendTo?.current, [appendTo]);
  const referencedVirtualElement = useCallback(
    () => ({ getBoundingClientRect: getReferenceClientRect }),
    [getReferenceClientRect]
  );
  const menuOptions = useMemo(() => ({ offset: 8, flip: false }), []);

  const onAlignImageLeft = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('left').run();
  }, [editor]);

  const onAlignImageCenter = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('center').run();
  }, [editor]);

  const onAlignImageRight = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('right').run();
  }, [editor]);

  const onWidthChange = useCallback(
    (value: number) => {
      editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockWidth(value).run();
    },
    [editor]
  );
  const { isImageCenter, isImageLeft, isImageRight, width } = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isImageLeft: ctx.editor.isActive('imageBlock', { align: 'left' }),
        isImageCenter: ctx.editor.isActive('imageBlock', { align: 'center' }),
        isImageRight: ctx.editor.isActive('imageBlock', { align: 'right' }),
        width: parseInt(ctx.editor.getAttributes('imageBlock')?.width || 0),
      };
    },
  });

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey={`imageBlockMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      appendTo={menuAppendTo}
      getReferencedVirtualElement={referencedVirtualElement}
      options={menuOptions}
    >
      <Toolbar.Wrapper shouldShowContent={shouldShow()} ref={menuRef}>
        <Toolbar.Button tooltip="Align image left" active={isImageLeft} onClick={onAlignImageLeft}>
          <Icon name="AlignHorizontalDistributeStart" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Align image center"
          active={isImageCenter}
          onClick={onAlignImageCenter}
        >
          <Icon name="AlignHorizontalDistributeCenter" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Align image right"
          active={isImageRight}
          onClick={onAlignImageRight}
        >
          <Icon name="AlignHorizontalDistributeEnd" />
        </Toolbar.Button>
        <Toolbar.Divider />
        <ImageBlockWidth onChange={onWidthChange} value={width} />
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
};

export default ImageBlockMenu;
