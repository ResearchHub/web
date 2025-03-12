import React, { ReactNode } from 'react';
import { SectionHeaderProps } from './renderUtils';
import hljs from 'highlight.js';
import { useEffect } from 'react';

interface TipTapRendererProps {
  content: any;
  debug?: boolean;
  renderSectionHeader?: (props: SectionHeaderProps) => ReactNode;
}

/**
 * Applies formatting marks to content
 */
export const renderTextWithMarks = (text: string, marks: any[]): ReactNode => {
  if (!text) return null;

  let result: ReactNode = text;

  if (marks && marks.length > 0) {
    // Apply marks in reverse order to ensure proper nesting
    [...marks].reverse().forEach((mark) => {
      switch (mark.type) {
        case 'bold':
          result = <strong className="tiptap-bold">{result}</strong>;
          break;
        case 'italic':
          result = <em className="tiptap-italic">{result}</em>;
          break;
        case 'underline':
          result = <u className="tiptap-underline">{result}</u>;
          break;
        case 'strike':
          result = <s className="tiptap-strike">{result}</s>;
          break;
        case 'code':
          result = <code className="tiptap-inline-code bg-gray-100 px-1 rounded">{result}</code>;
          break;
        case 'link':
          result = (
            <a
              className="tiptap-link text-blue-600 hover:underline"
              href={mark.attrs?.href}
              target={mark.attrs?.target || '_blank'}
              rel="noopener noreferrer"
              title={mark.attrs?.title}
            >
              {result}
            </a>
          );
          break;
        default:
          // Unhandled mark type
          break;
      }
    });
  }

  return result;
};

/**
 * TipTap JSON Renderer for React
 * Renders TipTap JSON content without requiring the editor
 */
const TipTapRenderer: React.FC<TipTapRendererProps> = ({
  content,
  debug = false,
  renderSectionHeader,
}) => {
  // Handle different content formats
  let documentContent = content;

  // Case 1: Content is wrapped in a top-level content property
  if (
    documentContent?.content &&
    typeof documentContent.content === 'object' &&
    documentContent.content.type === 'doc'
  ) {
    if (debug) console.log('Found nested content structure, extracting inner document');
    documentContent = documentContent.content;
  }

  // Case 2: Content is not a valid TipTap document
  if (!documentContent?.type || documentContent.type !== 'doc') {
    if (debug) console.log('Content is not a valid TipTap document, creating one');
    documentContent = {
      type: 'doc',
      content: Array.isArray(documentContent?.content)
        ? documentContent.content
        : Array.isArray(documentContent)
          ? documentContent
          : [],
    };
  }

  useEffect(() => {
    // Find all pre code blocks and apply highlighting
    const codeBlocks = window.document.querySelectorAll('pre code');
    codeBlocks.forEach((block: Element) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  return (
    <div className="tiptap-renderer">
      <RenderNode node={documentContent} debug={debug} renderSectionHeader={renderSectionHeader} />
    </div>
  );
};

interface RenderNodeProps {
  node: any;
  debug?: boolean;
  renderSectionHeader?: (props: SectionHeaderProps) => ReactNode;
}

/**
 * Renders a TipTap node based on its type
 */
const RenderNode: React.FC<RenderNodeProps> = ({ node, debug = false, renderSectionHeader }) => {
  if (!node) {
    if (debug) console.log('No node to render');
    return null;
  }

  // Handle document node
  if (node.type === 'doc') {
    if (debug) console.log('Rendering doc node with', node.content?.length || 0, 'children');
    return (
      <div className="tiptap-doc">
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </div>
    );
  }

  // Handle text nodes
  if (node.type === 'text') {
    return renderTextWithMarks(node.text || '', node.marks || []);
  }

  // Handle paragraph nodes
  if (node.type === 'paragraph') {
    return (
      <p className="tiptap-paragraph my-2">
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </p>
    );
  }

  // Handle heading nodes
  if (node.type === 'heading') {
    const HeadingTag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <HeadingTag className={`tiptap-heading tiptap-h${node.attrs?.level || 1} my-4`}>
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </HeadingTag>
    );
  }

  // Handle blockquote nodes
  if (node.type === 'blockquote') {
    return (
      <blockquote className="tiptap-blockquote border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </blockquote>
    );
  }

  // Handle code block nodes
  if (node.type === 'code_block') {
    return (
      <pre
        className={`tiptap-code-block bg-gray-800 text-gray-100 p-4 rounded my-4 overflow-x-auto`}
      >
        <code>{node.content?.map((textNode: any) => textNode.text || '').join('')}</code>
      </pre>
    );
  }

  // Handle horizontal rule
  if (node.type === 'horizontalRule') {
    return <hr className="tiptap-hr my-4" />;
  }

  // Handle hard break
  if (node.type === 'hardBreak') {
    return <br className="tiptap-hard-break" />;
  }

  // Handle bullet list
  if (node.type === 'bullet_list') {
    return (
      <ul className="tiptap-bullet-list list-disc pl-5 my-4">
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </ul>
    );
  }

  // Handle ordered list
  if (node.type === 'ordered_list') {
    return (
      <ol className="tiptap-ordered-list list-decimal pl-5 my-4" start={node.attrs?.start || 1}>
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </ol>
    );
  }

  // Handle list item
  if (node.type === 'list_item') {
    return (
      <li className="tiptap-list-item">
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </li>
    );
  }

  // Handle image
  if (node.type === 'image') {
    return (
      <img
        className="tiptap-image my-4"
        src={node.attrs?.src}
        alt={node.attrs?.alt || ''}
        title={node.attrs?.title}
        width={node.attrs?.width}
        height={node.attrs?.height}
      />
    );
  }

  // Handle section header (custom node type for reviews)
  if (node.type === 'sectionHeader' && renderSectionHeader) {
    return renderSectionHeader({
      title: node.attrs.title,
      description: node.attrs.description,
      rating: node.attrs.rating,
    });
  }

  // If it's an array (content array)
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((childNode, i) => (
          <RenderNode
            key={i}
            node={childNode}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
          />
        ))}
      </>
    );
  }

  // Fallback for unhandled node types
  if (debug) console.warn(`Unhandled node type: ${node.type}`, node);
  return null;
};

export default TipTapRenderer;
