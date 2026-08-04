import React, { useCallback, useMemo, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';

import { MenuProps } from '../types';
import { LinkPreviewPanel } from '@/components/Editor/components/panels/LinkPreviewPanel';
import { LinkEditorPanel } from '@/components/Editor/components/panels';

export const LinkMenu = ({ editor, appendTo }: MenuProps): React.JSX.Element => {
  const [showEdit, setShowEdit] = useState(false);
  // Must be referentially stable, like `options` below: BubbleMenu dispatches
  // an editor transaction whenever `appendTo` changes identity.
  const appendToElement = useCallback(() => appendTo?.current, [appendTo]);
  const { link, target } = useEditorState({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes('link');
      return { link: attrs.href, target: attrs.target };
    },
  });

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('link');
    return isActive;
  }, [editor]);

  const handleEdit = useCallback(() => {
    setShowEdit(true);
  }, []);

  const onSetLink = useCallback(
    (url: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: openInNewTab ? '_blank' : '' })
        .run();
      setShowEdit(false);
    },
    [editor]
  );

  const onUnsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowEdit(false);
    return null;
  }, [editor]);

  // Must be referentially stable: BubbleMenu dispatches an editor transaction
  // whenever `options` changes identity, so an inline literal would loop.
  const menuOptions = useMemo(
    () => ({
      flip: false,
      onHide: () => {
        setShowEdit(false);
      },
    }),
    []
  );

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="linkMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      options={menuOptions}
      appendTo={appendToElement}
    >
      {showEdit ? (
        <LinkEditorPanel
          initialUrl={link}
          initialOpenInNewTab={target === '_blank'}
          onSetLink={onSetLink}
        />
      ) : (
        <LinkPreviewPanel url={link} onClear={onUnsetLink} onEdit={handleEdit} />
      )}
    </BaseBubbleMenu>
  );
};

export default LinkMenu;
