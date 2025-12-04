'use client';

import React, { ReactNode, useState } from 'react';
import { SectionHeaderProps } from './renderUtils';
import hljs from 'highlight.js';
import { useEffect } from 'react';
import { buildWorkUrl } from '@/utils/url';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface TipTapRendererProps {
  content: any;
  debug?: boolean;
  renderSectionHeader?: (props: SectionHeaderProps) => ReactNode;
  truncate?: boolean;
  maxLength?: number;
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
 * Helper function to extract plain text from TipTap JSON
 */
export const extractPlainText = (node: any): string => {
  if (!node) return '';

  // If it's a text node, return its text content
  if (node.type === 'text') {
    return node.text || '';
  }

  // If it's a mention node, return its label or displayName (including @ for people mentions)
  if (node.type === 'mention') {
    const entityType = node.attrs?.entityType;
    const name = node.attrs?.displayName || node.attrs?.label || '';
    // Add '@' prefix for user/author mentions, else just name
    if (entityType === 'user' || entityType === 'author') {
      return name;
    }
    return name;
  }

  // If it has content, recursively extract text from all children
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractPlainText).join('');
  }

  return '';
};

/**
 * TipTap JSON Renderer for React
 * Renders TipTap JSON content without requiring the editor
 */
const TipTapRenderer: React.FC<TipTapRendererProps> = ({
  content,
  debug = false,
  renderSectionHeader,
  truncate = false,
  maxLength = 300,
}) => {
  if (debug) {
    console.log('||TipTapRenderer props received:', {
      truncate,
      maxLength,
      contentType: content?.type || 'unknown',
    });
  }

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

  // If truncation is enabled, extract the full text to check length
  let shouldTruncate = false;
  if (truncate) {
    const fullText = extractPlainText(documentContent);
    shouldTruncate = fullText.length > maxLength;

    if (debug) {
      console.log('||TipTapRenderer fullText.length', fullText.length);
      console.log('||TipTapRenderer maxLength', maxLength);
      console.log('||TipTapRenderer shouldTruncate', shouldTruncate);
      console.log('||TipTapRenderer truncate param', truncate);
    }
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
      <RenderNode
        node={documentContent}
        debug={debug}
        renderSectionHeader={renderSectionHeader}
        truncate={shouldTruncate}
        maxLength={maxLength}
      />
    </div>
  );
};

interface RenderNodeProps {
  node: any;
  debug?: boolean;
  renderSectionHeader?: (props: SectionHeaderProps) => ReactNode;
  truncate?: boolean;
  maxLength?: number;
  currentLength?: number; // Track current text length for truncation
}

interface RenderChildrenWithTruncationResult {
  children: ReactNode[];
  finalLength: number;
}

const renderChildrenWithTruncation = (
  content: any[] | undefined,
  props: {
    debug?: boolean;
    renderSectionHeader?: (props: SectionHeaderProps) => ReactNode;
    truncate: boolean;
    maxLength: number;
    currentLength: number;
  }
): RenderChildrenWithTruncationResult => {
  const { debug, renderSectionHeader, truncate, maxLength, currentLength } = props;

  if (!truncate) {
    return { children: [], finalLength: currentLength };
  }

  const renderedChildren: ReactNode[] = [];
  let trackedLength = currentLength;

  for (const child of content || []) {
    if (!child) continue;

    if (trackedLength >= maxLength) {
      if (debug) {
        console.log(
          '||renderChildrenWithTruncation: Breaking loop due to length',
          trackedLength,
          '>=',
          maxLength
        );
      }
      break;
    }

    const childTextLength = extractPlainText(child).length;
    const wouldExceedLimit = trackedLength + childTextLength > maxLength;

    if (debug) {
      console.log(
        '||renderChildrenWithTruncation: Processing child',
        child.type,
        'textLength:',
        childTextLength,
        'currentTotal:',
        trackedLength,
        'wouldExceed:',
        wouldExceedLimit
      );
    }

    const childNode = (
      <RenderNode
        key={renderedChildren.length}
        node={child}
        debug={debug}
        renderSectionHeader={renderSectionHeader}
        truncate={truncate}
        maxLength={maxLength}
        currentLength={trackedLength}
      />
    );
    renderedChildren.push(childNode);

    if (wouldExceedLimit) {
      trackedLength = maxLength;
      break;
    } else {
      trackedLength += childTextLength;
    }
  }

  return { children: renderedChildren, finalLength: trackedLength };
};

/**
 * Renders a TipTap node based on its type
 */
const RenderNode: React.FC<RenderNodeProps> = ({
  node,
  debug = false,
  renderSectionHeader,
  truncate = false,
  maxLength = 300,
  currentLength = 0,
}) => {
  // Log regardless of debug flag
  if (debug) console.log('RenderNode FUNCTION CALLED', node?.type || 'unknown type');

  if (!node) {
    if (debug) console.log('No node to render');
    return null;
  }

  // For truncation, we need to track how much text we've rendered
  let textLengthSoFar = currentLength;

  /**
   * Helper function to render children with truncation support
   * Returns either truncated children or maps over content directly
   */
  const renderChildrenConditionally = (
    truncatedChildren: ReactNode[],
    content: any[] | undefined
  ): ReactNode[] => {
    if (truncate) {
      return truncatedChildren;
    }
    return (
      content?.map((child: any, i: number) => (
        <RenderNode
          key={i}
          node={child}
          debug={debug}
          renderSectionHeader={renderSectionHeader}
          truncate={truncate}
          maxLength={maxLength}
          currentLength={textLengthSoFar}
        />
      )) || []
    );
  };

  // If we've already exceeded the max length and truncation is enabled, don't render more
  if (truncate && textLengthSoFar >= maxLength) {
    if (debug)
      console.log('||RenderNode: Skipping node due to length', textLengthSoFar, '>=', maxLength);
    return null;
  }

  // Handle document node
  if (node.type === 'doc') {
    if (debug) {
      console.log('Rendering doc node with', node.content?.length || 0, 'children');
      console.log('||RenderNode doc: truncate=', truncate, 'maxLength=', maxLength);
    }

    // For truncation, we need to render children one by one and track length
    if (truncate) {
      const { children } = renderChildrenWithTruncation(node.content, {
        debug,
        renderSectionHeader,
        truncate,
        maxLength,
        currentLength: 0,
      });
      return <div className="tiptap-doc">{children}</div>;
    }

    // Normal rendering without truncation
    return (
      <div className="tiptap-doc">
        {node.content?.map((child: any, i: number) => (
          <RenderNode
            key={i}
            node={child}
            debug={debug}
            renderSectionHeader={renderSectionHeader}
            truncate={truncate}
            maxLength={maxLength}
            currentLength={textLengthSoFar}
          />
        ))}
      </div>
    );
  }

  // Handle text nodes
  if (node.type === 'text') {
    const text = node.text || '';
    if (debug)
      console.log(
        'TEXT NODE',
        text.substring(0, 20) + '...',
        'truncate:',
        truncate,
        'textLengthSoFar:',
        textLengthSoFar
      );

    // For truncation, we may need to cut the text
    if (truncate && textLengthSoFar + text.length > maxLength) {
      const remainingLength = maxLength - textLengthSoFar;
      const truncatedText = text.substring(0, remainingLength);
      if (debug) console.log('TRUNCATING TEXT to', truncatedText + '...');
      return (
        <>
          {renderTextWithMarks(truncatedText, node.marks || [])}
          <span className="text-gray-500 text-sm font-semibold">[...]</span>
        </>
      );
    }

    return renderTextWithMarks(text, node.marks || []);
  }

  // Handle paragraph nodes
  if (node.type === 'paragraph') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <p className="tiptap-paragraph my-2">{renderChildrenConditionally(children, node.content)}</p>
    );
  }

  // Handle heading nodes
  if (node.type === 'heading') {
    const HeadingTag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <HeadingTag className={`tiptap-heading tiptap-h${node.attrs?.level || 1} my-4`}>
        {renderChildrenConditionally(children, node.content)}
      </HeadingTag>
    );
  }

  // Handle blockquote nodes
  if (node.type === 'blockquote') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <blockquote className="tiptap-blockquote border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {renderChildrenConditionally(children, node.content)}
      </blockquote>
    );
  }

  // Handle code block nodes
  if (node.type === 'code_block' || node.type === 'codeBlock') {
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

  // Handle ordered list
  if (node.type === 'orderedList') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <ol className="tiptap-ordered-list list-decimal pl-5 my-4" start={node.attrs?.start || 1}>
        {renderChildrenConditionally(children, node.content)}
      </ol>
    );
  }

  // Handle ordered_list (compatibility with ProseMirror schema naming)
  if (node.type === 'ordered_list') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <ol className="tiptap-ordered-list list-decimal pl-5 my-4" start={node.attrs?.start || 1}>
        {renderChildrenConditionally(children, node.content)}
      </ol>
    );
  }

  // Handle bullet list
  if (node.type === 'bulletList') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <ul className="tiptap-bullet-list list-disc pl-5 my-4">
        {renderChildrenConditionally(children, node.content)}
      </ul>
    );
  }

  // Handle bullet_list (compatibility with ProseMirror schema naming)
  if (node.type === 'bullet_list') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <ul className="tiptap-bullet-list list-disc pl-5 my-4">
        {renderChildrenConditionally(children, node.content)}
      </ul>
    );
  }

  // Handle list item
  if (node.type === 'list_item' || node.type === 'listItem') {
    const { children } = renderChildrenWithTruncation(node.content, {
      debug,
      renderSectionHeader,
      truncate,
      maxLength,
      currentLength: textLengthSoFar,
    });

    return (
      <li className="tiptap-list-item">{renderChildrenConditionally(children, node.content)}</li>
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

  // Handle mention nodes (user, author, paper, post, etc.)
  if (node.type === 'mention') {
    const entityType = node.attrs?.entityType;
    const id = node.attrs?.id;
    const authorProfileId = node.attrs?.authorProfileId;
    const label = node.attrs?.displayName || node.attrs?.label || '';

    // Determine rendering based on entity type
    if (entityType === 'user' || entityType === 'author') {
      const displayText = label;
      const profileId = authorProfileId || id;
      if (!profileId) {
        return <span className="mention">{displayText}</span>;
      }
      return (
        <span
          className="mention text-blue-600 hover:underline cursor-pointer"
          onClick={() => navigateToAuthorProfile(profileId, true)}
        >
          {displayText}
        </span>
      );
    }

    // For papers
    if (entityType === 'paper') {
      const href = buildWorkUrl({ id, doi: node.attrs?.doi, contentType: 'paper' });
      if (!href || href === '#') {
        return <span className="mention">{label}</span>;
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mention text-blue-600 hover:underline"
        >
          {label}
        </a>
      );
    }

    // For posts
    if (entityType === 'post') {
      const href = buildWorkUrl({ id, contentType: 'post' });
      if (!href || href === '#') {
        return <span className="mention">{label}</span>;
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mention text-blue-600 hover:underline"
        >
          {label}
        </a>
      );
    }

    // Default fallback
    return <span className="mention">{label}</span>;
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
            truncate={truncate}
            maxLength={maxLength}
            currentLength={textLengthSoFar}
          />
        ))}
      </>
    );
  }

  // Fallback for unhandled node types
  if (debug) {
    console.warn(`Unhandled node type: ${node.type}`, node);
    // Only in debug mode, render a visible indication of unhandled nodes
    return (
      <div className="p-2 border border-red-500 my-2 text-xs">
        <div>
          Unhandled node type: <strong>{node.type}</strong>
        </div>
        <pre className="mt-1 bg-gray-100 p-1 overflow-auto max-h-24">
          {JSON.stringify(node, null, 2)}
        </pre>
      </div>
    );
  }
  return null;
};

export default TipTapRenderer;
