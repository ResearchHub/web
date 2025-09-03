/**
 * Converts HTML string to TipTap JSON format
 * This is a lightweight converter that doesn't require a full TipTap editor instance
 */

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

/**
 * Parse HTML string to DOM and convert to TipTap JSON
 */
export const htmlToTipTapJSON = (html: string): TipTapNode => {
  if (!html) {
    return {
      type: 'doc',
      content: [],
    };
  }

  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  return {
    type: 'doc',
    content: convertNodeList(doc.body.childNodes),
  };
};

/**
 * Convert a NodeList to TipTap nodes
 */
const convertNodeList = (nodes: NodeListOf<ChildNode>): TipTapNode[] => {
  const result: TipTapNode[] = [];

  nodes.forEach((node) => {
    const tipTapNode = convertNode(node);
    if (tipTapNode) {
      result.push(tipTapNode);
    }
  });

  return result;
};

/**
 * Convert a single DOM node to TipTap node
 */
const convertNode = (node: Node): TipTapNode | null => {
  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (!text.trim()) return null; // Skip empty text nodes

    return {
      type: 'text',
      text,
    };
  }

  // Element node
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'p':
        return {
          type: 'paragraph',
          content: convertNodeList(element.childNodes),
        };

      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          attrs: { level: parseInt(tagName[1]) },
          content: convertNodeList(element.childNodes),
        };

      case 'blockquote':
        return {
          type: 'blockquote',
          content: convertNodeList(element.childNodes),
        };

      case 'ul':
        return {
          type: 'bulletList',
          content: convertNodeList(element.childNodes),
        };

      case 'ol':
        return {
          type: 'orderedList',
          content: convertNodeList(element.childNodes),
        };

      case 'li':
        return {
          type: 'listItem',
          content: convertNodeList(element.childNodes),
        };

      case 'pre':
        // Check if it contains a code element
        const codeElement = element.querySelector('code');
        if (codeElement) {
          return {
            type: 'codeBlock',
            attrs: {
              language: codeElement.className.replace('language-', '') || null,
            },
            content: [
              {
                type: 'text',
                text: codeElement.textContent || '',
              },
            ],
          };
        }
        return {
          type: 'codeBlock',
          content: [
            {
              type: 'text',
              text: element.textContent || '',
            },
          ],
        };

      case 'code':
        // Inline code (not inside pre)
        if (element.parentElement?.tagName.toLowerCase() !== 'pre') {
          return {
            type: 'text',
            text: element.textContent || '',
            marks: [{ type: 'code' }],
          };
        }
        return null; // Skip code inside pre (handled by pre)

      case 'hr':
        return {
          type: 'horizontalRule',
        };

      case 'br':
        return {
          type: 'hardBreak',
        };

      case 'img':
        return {
          type: 'image',
          attrs: {
            src: element.getAttribute('src') || '',
            alt: element.getAttribute('alt') || '',
            title: element.getAttribute('title') || null,
            width: element.getAttribute('width') || null,
            height: element.getAttribute('height') || null,
          },
        };

      case 'a':
        // Process link content with mark
        const linkContent = processInlineContent(element);
        linkContent.forEach((node) => {
          if (node.type === 'text') {
            if (!node.marks) node.marks = [];
            node.marks.push({
              type: 'link',
              attrs: {
                href: element.getAttribute('href') || '',
                target: element.getAttribute('target') || null,
                rel: element.getAttribute('rel') || null,
              },
            });
          }
        });
        return linkContent.length === 1 ? linkContent[0] : null;

      case 'strong':
      case 'b':
        return processInlineElement(element, 'bold');

      case 'em':
      case 'i':
        return processInlineElement(element, 'italic');

      case 'u':
        return processInlineElement(element, 'underline');

      case 'del':
      case 's':
      case 'strike':
        return processInlineElement(element, 'strike');

      case 'sub':
        return processInlineElement(element, 'subscript');

      case 'sup':
        return processInlineElement(element, 'superscript');

      case 'mark':
        return processInlineElement(element, 'highlight');

      case 'div':
      case 'span':
        // For generic containers, just process their content
        const content = convertNodeList(element.childNodes);
        if (content.length === 1) {
          return content[0];
        } else if (content.length > 1) {
          return {
            type: 'paragraph',
            content,
          };
        }
        return null;

      default:
        // Unknown elements - treat as paragraph
        const unknownContent = convertNodeList(element.childNodes);
        if (unknownContent.length > 0) {
          return {
            type: 'paragraph',
            content: unknownContent,
          };
        }
        return null;
    }
  }

  return null;
};

/**
 * Process inline elements with marks
 */
const processInlineElement = (element: Element, markType: string): TipTapNode | null => {
  const content = processInlineContent(element);

  // Apply mark to all text nodes
  content.forEach((node) => {
    if (node.type === 'text') {
      if (!node.marks) node.marks = [];
      node.marks.push({ type: markType });
    }
  });

  return content.length === 1 ? content[0] : null;
};

/**
 * Process inline content and flatten it
 */
const processInlineContent = (element: Element): TipTapNode[] => {
  const result: TipTapNode[] = [];

  element.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) {
        result.push({
          type: 'text',
          text,
        });
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const converted = convertNode(child);
      if (converted) {
        if (converted.type === 'text') {
          result.push(converted);
        } else {
          // For nested inline elements, extract their text content
          const childElement = child as Element;
          const childContent = processInlineContent(childElement);
          result.push(...childContent);
        }
      }
    }
  });

  return result;
};
