import { EditorContent } from '@tiptap/react'
import React, { useRef } from 'react'
import { LinkMenu } from '@/components/Editor/components/menus'
import { useBlockEditor } from '@/components/Editor/hooks/useBlockEditor'
import '@/app/components/Editor/styles/index.css'
import ImageBlockMenu from '@/components/Editor/extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '@/components/Editor/extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '@/components/Editor/extensions/Table/menus'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'
import { useSidebar } from '@/components/Editor/hooks/useSidebar'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'

export const BlockEditor = ({
  aiToken,
  ydoc,
  provider,
}: {
  aiToken?: string
  ydoc: Y.Doc | null
  provider?: TiptapCollabProvider | null | undefined
}) => {
  const menuContainerRef = useRef(null)

  const leftSidebar = useSidebar()
  const { editor, users, collabState } = useBlockEditor({ aiToken, ydoc, provider })

  if (!editor || !users) {
    return null
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
    </div>
  )
}

export default BlockEditor
