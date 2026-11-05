import { Node } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';
import { useCallback } from 'react';
import { Command } from '@/components/Editor/extensions/SlashCommand/types';
import { DRAG_HANDLE_HIDE_META } from '@/components/Editor/lib/utils/dragHandle';

const useContentItemActions = (
  editor: Editor,
  currentNode: Node | null,
  currentNodePos: number
) => {
  const resetTextFormatting = useCallback(() => {
    const chain = editor.chain();

    chain.setNodeSelection(currentNodePos).unsetAllMarks();

    if (currentNode?.type.name !== 'paragraph') {
      chain.setParagraph();
    }

    chain.run();
  }, [editor, currentNodePos, currentNode?.type.name]);

  const duplicateNode = useCallback(() => {
    editor.commands.setNodeSelection(currentNodePos);

    const { $anchor } = editor.state.selection;
    const selectedNode = $anchor.node(1) || (editor.state.selection as NodeSelection).node;

    editor
      .chain()
      .setMeta(DRAG_HANDLE_HIDE_META, true)
      .insertContentAt(currentNodePos + (currentNode?.nodeSize || 0), selectedNode.toJSON())
      .run();
  }, [editor, currentNodePos, currentNode?.nodeSize]);

  const copyNodeToClipboard = useCallback(() => {
    editor.chain().setMeta(DRAG_HANDLE_HIDE_META, true).setNodeSelection(currentNodePos).run();

    document.execCommand('copy');
  }, [editor, currentNodePos]);

  const deleteNode = useCallback(() => {
    editor
      .chain()
      .setMeta(DRAG_HANDLE_HIDE_META, true)
      .setNodeSelection(currentNodePos)
      .deleteSelection()
      .run();
  }, [editor, currentNodePos]);

  const handleAdd = useCallback(() => {
    if (currentNodePos !== -1) {
      const currentNodeSize = currentNode?.nodeSize || 0;
      const insertPos = currentNodePos + currentNodeSize;
      const currentNodeIsEmptyParagraph =
        currentNode?.type.name === 'paragraph' && currentNode?.content?.size === 0;
      const focusPos = currentNodeIsEmptyParagraph ? currentNodePos + 2 : insertPos + 2;

      // Lets the slash menu undo this insertion if it is dismissed without a
      // command being picked, so an abandoned click leaves no stray `/`.
      editor.storage.slashCommand.pendingAutoInsert = {
        createdParagraph: !currentNodeIsEmptyParagraph,
      };

      editor
        .chain()
        // Hide the handle so the "+" cannot be clicked a second time while the
        // menu it just opened is still up.
        .setMeta(DRAG_HANDLE_HIDE_META, true)
        .command(({ dispatch, tr, state }) => {
          if (dispatch) {
            if (currentNodeIsEmptyParagraph) {
              tr.insertText('/', currentNodePos, currentNodePos + 1);
            } else {
              tr.insert(
                insertPos,
                state.schema.nodes.paragraph.create(null, [state.schema.text('/')])
              );
            }

            return dispatch(tr);
          }

          return true;
        })
        .focus(focusPos)
        .run();
    }
  }, [currentNode, currentNodePos, editor]);

  const turnInto = useCallback(
    (command: Command) => {
      if (currentNodePos === -1) return;

      if (command.convertAction) {
        editor.chain().setMeta(DRAG_HANDLE_HIDE_META, true).setNodeSelection(currentNodePos).run();
        command.convertAction(editor);
        return;
      }

      editor
        .chain()
        .setMeta(DRAG_HANDLE_HIDE_META, true)
        .setNodeSelection(currentNodePos)
        .deleteSelection()
        .run();
      command.action(editor);
    },
    [editor, currentNodePos]
  );

  return {
    resetTextFormatting,
    duplicateNode,
    copyNodeToClipboard,
    deleteNode,
    handleAdd,
    turnInto,
  };
};

export default useContentItemActions;
