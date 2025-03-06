import React, { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  rating: number;
}

/**
 * Renders Quill content as React nodes
 * @param quillContent The Quill content to render
 * @returns Array of React nodes
 */
export const renderQuillContent = (quillContent: any): ReactNode[] | null => {
  if (!quillContent || !quillContent.ops) return null;

  const result: ReactNode[] = [];
  let currentListItems: ReactNode[] = [];
  let isInList = false;
  let listType: 'ordered' | 'bullet' | null = null;
  let currentParagraph: ReactNode[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      result.push(
        <p key={`p-${result.length}`} className="my-4">
          {currentParagraph}
        </p>
      );
      currentParagraph = [];
    }
  };

  quillContent.ops.forEach((op: any, index: number) => {
    if (!op.insert) return;

    // Handle text with attributes
    if (typeof op.insert === 'string') {
      const text = op.insert;
      const attributes = op.attributes || {};

      // Handle list items
      if (attributes.list) {
        if (!isInList || listType !== attributes.list) {
          // Flush any current list
          if (isInList && currentListItems.length > 0) {
            result.push(
              listType === 'ordered' ? (
                <ol key={`list-${result.length}`} className="list-decimal pl-5 my-4">
                  {currentListItems}
                </ol>
              ) : (
                <ul key={`list-${result.length}`} className="list-disc pl-5 my-4">
                  {currentListItems}
                </ul>
              )
            );
            currentListItems = [];
          }

          isInList = true;
          listType = attributes.list as 'ordered' | 'bullet';
        }

        // Add the list item
        currentListItems.push(<li key={`li-${index}`}>{text}</li>);
        return;
      } else if (isInList) {
        // End the current list
        result.push(
          listType === 'ordered' ? (
            <ol key={`list-${result.length}`} className="list-decimal pl-5 my-4">
              {currentListItems}
            </ol>
          ) : (
            <ul key={`list-${result.length}`} className="list-disc pl-5 my-4">
              {currentListItems}
            </ul>
          )
        );
        currentListItems = [];
        isInList = false;
        listType = null;
      }

      // Handle block quotes
      if (attributes.blockquote) {
        flushParagraph();
        result.push(
          <blockquote
            key={`blockquote-${index}`}
            className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
          >
            {text}
          </blockquote>
        );
        return;
      }

      // Handle code blocks
      if (attributes.code) {
        flushParagraph();
        result.push(
          <pre
            key={`code-${index}`}
            className="bg-gray-800 text-gray-100 p-4 rounded my-4 overflow-x-auto"
          >
            <code>{text}</code>
          </pre>
        );
        return;
      }

      // Handle headers
      if (attributes.header) {
        flushParagraph();
        const HeaderTag = `h${attributes.header}` as keyof JSX.IntrinsicElements;
        result.push(
          <HeaderTag key={`h-${index}`} className="my-4">
            {text}
          </HeaderTag>
        );
        return;
      }

      // Handle regular text with inline formatting
      let formattedText: ReactNode = text;

      // Apply inline formatting
      if (attributes.bold) formattedText = <strong key={`bold-${index}`}>{formattedText}</strong>;
      if (attributes.italic) formattedText = <em key={`italic-${index}`}>{formattedText}</em>;
      if (attributes.underline) formattedText = <u key={`underline-${index}`}>{formattedText}</u>;
      if (attributes.strike) formattedText = <s key={`strike-${index}`}>{formattedText}</s>;
      if (attributes.link) {
        formattedText = (
          <a
            key={`link-${index}`}
            href={attributes.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {formattedText}
          </a>
        );
      }

      // Handle line breaks
      if (text === '\n') {
        flushParagraph();
        return;
      }

      // Add to current paragraph
      currentParagraph.push(<span key={`span-${index}`}>{formattedText}</span>);
    } else if (op.insert.image) {
      // Handle images
      flushParagraph();
      result.push(
        <img
          key={`img-${index}`}
          src={op.insert.image}
          alt="Embedded content"
          className="my-4 max-w-full"
        />
      );
    }
  });

  // Flush any remaining paragraph content
  flushParagraph();

  // Flush any remaining list items
  if (isInList && currentListItems.length > 0) {
    result.push(
      listType === 'ordered' ? (
        <ol key={`list-final`} className="list-decimal pl-5 my-4">
          {currentListItems}
        </ol>
      ) : (
        <ul key={`list-final`} className="list-disc pl-5 my-4">
          {currentListItems}
        </ul>
      )
    );
  }

  return result;
};

/**
 * Truncates content to a reasonable length for preview
 * @param content Array of React nodes to truncate
 * @returns Truncated content
 */
export const truncateContent = (content: ReactNode[]): ReactNode[] => {
  if (!content || content.length === 0) return [];

  // For simplicity, just return the first element
  // This could be enhanced to be smarter about truncation
  return [content[0]];
};
