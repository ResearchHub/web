# Comment System Components

This directory contains utility functions and components for the comment system in ResearchHub.

## TipTap Renderer

The `TipTapRenderer` component is a standalone renderer for TipTap JSON content. It allows rendering TipTap documents without requiring the full TipTap editor to be loaded.

### Usage

```tsx
import TipTapRenderer from './lib/TipTapRenderer';

// Basic usage
<TipTapRenderer content={tipTapContent} />

// With debug mode
<TipTapRenderer content={tipTapContent} debug={true} />

// With custom section header renderer
<TipTapRenderer
  content={tipTapContent}
  renderSectionHeader={(props) => (
    <CustomSectionHeader {...props} />
  )}
/>
```

### Props

- `content`: The TipTap JSON content to render
- `debug` (optional): Whether to log debug information
- `renderSectionHeader` (optional): Custom renderer for section headers

### Exported Utilities

The `TipTapRenderer` module also exports the following utility functions:

- `renderTextWithMarks`: Renders text with formatting marks (bold, italic, etc.)

```tsx
import { renderTextWithMarks } from './lib/TipTapRenderer';

// Example usage
const formattedText = renderTextWithMarks('Hello world', [{ type: 'bold' }]);
```

### Supported Node Types

The renderer supports the following TipTap node types:

- Document (`doc`)
- Paragraph (`paragraph`)
- Text (`text`)
- Heading (`heading`)
- Blockquote (`blockquote`)
- Code Block (`code_block`)
- Horizontal Rule (`horizontalRule`)
- Hard Break (`hardBreak`)
- Bullet List (`bullet_list`)
- Ordered List (`ordered_list`)
- List Item (`list_item`)
- Image (`image`)
- Section Header (`sectionHeader`) - Custom node type for reviews

### Supported Mark Types

The renderer supports the following mark types:

- Bold (`bold`)
- Italic (`italic`)
- Underline (`underline`)
- Strike (`strike`)
- Code (`code`)
- Link (`link`)

## Content Parsing

The `commentContentUtils.ts` file contains utilities for parsing and formatting comment content.

### Key Functions

- `parseContent`: Parses content based on its format (TIPTAP or QUILL_EDITOR)
- `extractTextFromTipTap`: Extracts plain text from a TipTap document
- `isContentEmpty`: Checks if content is empty
- `getFormattedCommentContent`: Gets properly formatted content from a comment

### Content Format Handling

The parser handles various content formats and edge cases:

1. Content wrapped in a top-level `content` property:

   ```json
   {"content":{"type":"doc","content":[...]}}
   ```

2. TipTap document nested inside another TipTap document:

   ```json
   {"type":"doc","content":[{"content":{"type":"doc","content":[...]}}]}
   ```

3. Content array without a doc wrapper:
   ```json
   { "content": [{ "type": "paragraph", "content": [{ "text": "text", "type": "text" }] }] }
   ```

## Rendering Utilities

The `renderUtils.tsx` file contains utilities for rendering comment content.

### Key Functions

- `renderQuillContent`: Renders Quill content as React nodes
- `truncateContent`: Truncates content to a reasonable length for preview

## Comment Components

- `CommentReadOnly`: Renders comment content in read-only mode
- `CommentEditor`: Editor for creating and editing comments
- `CommentItem`: Renders a comment with header, content, and actions

## Component Relationships

- `CommentReadOnly` uses `TipTapRenderer` to render TipTap content and `renderQuillContent` from `renderUtils.tsx` to render Quill content
- `TipTapRenderer` exports `renderTextWithMarks` which is used internally to render text with formatting marks
- `parseContent` from `commentContentUtils.ts` is used by both `CommentReadOnly` and `CommentItem` to parse content before rendering

## Debugging

Most components and utilities accept a `debug` prop that enables logging of internal state and operations. This is useful for troubleshooting rendering issues.

Example:

```tsx
<CommentReadOnly content={comment.content} contentFormat={comment.contentFormat} debug={true} />
```

## Edge Cases and Error Handling

The implementation handles various edge cases:

1. Nested content structures
2. Invalid or malformed TipTap documents
3. Different content formats (TIPTAP, QUILL_EDITOR)
4. Empty or null content

Error handling is implemented throughout the components to ensure graceful degradation when encountering invalid content.
