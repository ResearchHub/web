import { ContentFormat } from '@/types/comment';

/**
 * Parses content based on its format
 * @param content The content to parse
 * @param contentFormat The format of the content
 * @param debug Whether to log debug information
 * @returns Parsed content
 */
export const parseContent = (
  content: any,
  contentFormat: ContentFormat = 'TIPTAP',
  debug: boolean = false
): any => {
  if (!content) return null;

  if (debug) {
    console.log('parseContent input:', content);
  }

  try {
    // Case 1: Content is wrapped in a top-level content property
    // Example: {"content":{"type":"doc","content":[...]}}
    if (
      contentFormat === 'TIPTAP' &&
      typeof content === 'object' &&
      content.content &&
      typeof content.content === 'object' &&
      content.content.type === 'doc'
    ) {
      if (debug) {
        console.log(
          'Found content wrapped in top-level content property, extracting inner document'
        );
      }

      // Extract the inner document
      return content.content;
    }

    // Case 2: TipTap document nested inside another TipTap document
    // Example: {"type":"doc","content":[{"content":{"type":"doc","content":[...]}}]}
    if (
      contentFormat === 'TIPTAP' &&
      content.type === 'doc' &&
      Array.isArray(content.content) &&
      content.content.length === 1 &&
      content.content[0].content &&
      content.content[0].content.type === 'doc'
    ) {
      if (debug) {
        console.log('Found nested TipTap document, extracting inner document');
      }

      // Extract the inner document
      return content.content[0].content;
    }

    // Case 3: Content is a valid TipTap document but is wrapped in a content property
    // Example: {"content":[{"type":"paragraph","content":[{"text":"text","type":"text"}]}]}
    if (
      contentFormat === 'TIPTAP' &&
      typeof content === 'object' &&
      content.content &&
      Array.isArray(content.content) &&
      !content.type
    ) {
      if (debug) {
        console.log('Found content array without doc wrapper, creating proper document structure');
      }

      // Create a proper document structure
      return {
        type: 'doc',
        content: content.content,
      };
    }

    // If content is a string, try to parse it as JSON
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);

        // Check for Case 1 in parsed string
        if (
          contentFormat === 'TIPTAP' &&
          typeof parsed === 'object' &&
          parsed.content &&
          typeof parsed.content === 'object' &&
          parsed.content.type === 'doc'
        ) {
          if (debug) {
            console.log('Found content wrapped in top-level content property in parsed string');
          }

          return parsed.content;
        }

        // Check for Case 2 in parsed string
        if (
          contentFormat === 'TIPTAP' &&
          parsed.type === 'doc' &&
          Array.isArray(parsed.content) &&
          parsed.content.length === 1 &&
          parsed.content[0].content &&
          parsed.content[0].content.type === 'doc'
        ) {
          if (debug) {
            console.log('Found nested TipTap document in parsed string');
          }

          return parsed.content[0].content;
        }

        // Check for Case 3 in parsed string
        if (
          contentFormat === 'TIPTAP' &&
          typeof parsed === 'object' &&
          parsed.content &&
          Array.isArray(parsed.content) &&
          !parsed.type
        ) {
          if (debug) {
            console.log('Found content array without doc wrapper in parsed string');
          }

          // Create a proper document structure
          return {
            type: 'doc',
            content: parsed.content,
          };
        }

        return parsed;
      } catch (parseError) {
        // If parsing fails, it's probably plain text
        if (content.trim()) {
          if (contentFormat === 'TIPTAP') {
            return {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: content }],
                },
              ],
            };
          } else {
            return { ops: [{ insert: content }] };
          }
        }
      }
    }

    // For all other cases, return the content as is
    return content;
  } catch (error) {
    console.error('Error parsing content:', error);
    return content;
  }
};

/**
 * Extracts text content from TIPTAP JSON
 * @param tipTapContent TIPTAP content object
 * @returns Plain text content
 */
export const extractTextFromTipTap = (tipTapContent: any): string => {
  if (!tipTapContent || !tipTapContent.content) return '';

  let text = '';

  const processNode = (node: any): void => {
    if (node.text) {
      text += node.text;
    } else if (node.content && Array.isArray(node.content)) {
      node.content.forEach(processNode);
    }
  };

  if (Array.isArray(tipTapContent.content)) {
    tipTapContent.content.forEach(processNode);
  }

  return text;
};
