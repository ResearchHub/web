import React, { useState, useEffect } from 'react';
import { CommentContent } from './types';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface QuillRendererProps {
  content: CommentContent;
  containerClass?: string;
  debug?: boolean;
  truncate?: boolean;
  maxLength?: number;
}

// Simple read-only stars component for displaying review score
const ReadOnlyStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={cn(
            'mr-0.5',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
};

// Render a peer review rating component
const renderRating = (rating: { category: string; rating: number }) => {
  const { category, rating: score } = rating;
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center bg-gray-50 p-3 rounded-lg mb-4">
      <div className="font-medium text-gray-700 mr-3 mb-1 md:mb-0">{formattedCategory}:</div>
      <div className="flex items-center">
        <ReadOnlyStars rating={score} />
        <div className="ml-2 text-gray-600">({score}/5)</div>
      </div>
    </div>
  );
};

// Apply text formatting based on attributes
const formatText = (text: string, attributes: any = {}, key: string) => {
  if (!text) return null;

  let formattedText: React.ReactNode = text;

  // Apply each formatting option
  if (attributes.bold) {
    formattedText = <strong key={`bold-${key}`}>{formattedText}</strong>;
  }

  if (attributes.italic) {
    formattedText = <em key={`italic-${key}`}>{formattedText}</em>;
  }

  if (attributes.underline) {
    formattedText = <u key={`underline-${key}`}>{formattedText}</u>;
  }

  if (attributes.strike) {
    formattedText = <s key={`strike-${key}`}>{formattedText}</s>;
  }

  if (attributes.link) {
    formattedText = (
      <a
        key={`link-${key}`}
        href={attributes.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {formattedText}
      </a>
    );
  }

  return attributes.link ||
    attributes.bold ||
    attributes.italic ||
    attributes.underline ||
    attributes.strike ? (
    formattedText
  ) : (
    <span key={key}>{formattedText}</span>
  );
};

const QuillRenderer: React.FC<QuillRendererProps> = ({
  content,
  containerClass = '',
  debug = false,
  truncate = false,
  maxLength = 100,
}) => {
  const [parsedContent, setParsedContent] = useState<any>(null);

  useEffect(() => {
    // Parse the content if it's a string
    if (typeof content === 'string') {
      try {
        setParsedContent(JSON.parse(content));
      } catch (e) {
        console.error('Error parsing JSON:', e);
        setParsedContent(null);
      }
    } else {
      setParsedContent(content);
    }
  }, [content]);

  if (!parsedContent || !parsedContent.ops) {
    if (debug) console.log('[QuillRenderer] Invalid content format:', parsedContent);
    return null;
  }

  // Process the document and convert to React elements
  const renderContent = () => {
    if (!parsedContent.ops) return null;

    // Extract text content for debugging and truncation
    const extractTextContent = (ops: any[]): string => {
      return ops.reduce((text: string, op: any) => {
        if (typeof op.insert === 'string') {
          return text + op.insert;
        }
        return text;
      }, '');
    };

    const textContent = extractTextContent(parsedContent.ops);
    const shouldTruncate = truncate && textContent.length > maxLength;

    if (debug) {
      console.log('[QuillRenderer] Text content length:', textContent.length);
      console.log('[QuillRenderer] maxLength:', maxLength);
      console.log('[QuillRenderer] shouldTruncate:', shouldTruncate);
    }

    // If truncation is enabled, create a truncated version of the ops
    let processedOps = parsedContent.ops;

    if (shouldTruncate) {
      let charCount = 0;
      const truncatedOps = [];

      for (const op of parsedContent.ops) {
        if (typeof op.insert === 'string') {
          if (charCount + op.insert.length <= maxLength) {
            // Full op can be included
            truncatedOps.push(op);
            charCount += op.insert.length;
          } else {
            // Need to truncate this op
            const remainingChars = maxLength - charCount;
            if (remainingChars > 0) {
              // Add partial text
              truncatedOps.push({
                ...op,
                insert: op.insert.substring(0, remainingChars),
              });
            }
            // Add ellipsis as a separate op
            truncatedOps.push({
              insert: '...',
              attributes: op.attributes || {},
            });
            break;
          }
        } else {
          // Non-text insert (like images)
          truncatedOps.push(op);
        }
      }

      if (debug) {
        console.log('[QuillRenderer] Original ops length:', parsedContent.ops.length);
        console.log('[QuillRenderer] Truncated ops length:', truncatedOps.length);
      }

      processedOps = truncatedOps;
    }

    // First, preprocess to understand the document structure
    const documentStructure: any[] = [];
    let currentBlock: any = { type: 'paragraph', content: [], attributes: {} };

    // Preprocessor to rebuild the document structure
    processedOps.forEach((op: any, index: number) => {
      if (typeof op.insert === 'object') {
        if (Object.keys(op.insert).includes('user')) {
          // For user mentions, we want to keep the content inline
          // Add the user mention to the current block
          currentBlock.content.push({
            type: 'user-mention',
            content: op.insert,
            index,
          });
        } else {
          // For other special objects (like peer-review-rating)
          // Finish any current block
          if (currentBlock.content.length > 0) {
            documentStructure.push(currentBlock);
          }

          // Add the special block
          documentStructure.push({
            type: 'special',
            content: op.insert,
            index,
          });

          // Start a new paragraph
          currentBlock = { type: 'paragraph', content: [], attributes: {} };
        }
      } else if (typeof op.insert === 'string') {
        const text = op.insert;
        const attributes = op.attributes || {};

        if (text.includes('\n')) {
          const parts = text.split('\n');

          // Process each part
          parts.forEach((part: string, partIndex: number) => {
            const isLast = partIndex === parts.length - 1;

            // Add this text to the current block
            if (part.length > 0) {
              currentBlock.content.push({
                text: part,
                attributes: attributes,
                index: `${index}-${partIndex}`,
              });
            }

            // If not the last part, end the current block
            if (!isLast) {
              // Check if this is a list item
              if (attributes.list) {
                currentBlock.type = 'list-item';
                currentBlock.listType = attributes.list;
                currentBlock.attributes = attributes;
              }

              // Add the block to our structure
              if (currentBlock.content.length > 0 || currentBlock.type === 'list-item') {
                documentStructure.push(currentBlock);
              }

              // Start a new block
              currentBlock = { type: 'paragraph', content: [], attributes: {} };
            }
          });
        } else {
          // Simple text without line breaks
          currentBlock.content.push({
            text,
            attributes,
            index,
          });
        }
      }
    });

    // Add the final block if it has content
    if (currentBlock.content.length > 0) {
      documentStructure.push(currentBlock);
    }

    if (debug) {
      console.log('[QuillRenderer] Document structure:', documentStructure);
    }

    // Build lists from list items
    const processedStructure: any[] = [];
    let currentList: any = null;

    documentStructure.forEach((block, blockIndex) => {
      if (block.type === 'list-item') {
        // If we don't have a list yet, or the list type changed, start a new list
        if (!currentList || currentList.listType !== block.listType) {
          // Add any previous list
          if (currentList) {
            processedStructure.push(currentList);
          }

          // Start a new list
          currentList = {
            type: 'list',
            listType: block.listType,
            items: [],
          };
        }

        // Add this item to the current list
        currentList.items.push(block);
      } else {
        // This is not a list item, so add any current list
        if (currentList) {
          processedStructure.push(currentList);
          currentList = null;
        }

        // Add this block directly
        processedStructure.push(block);
      }
    });

    // Add any final list
    if (currentList) {
      processedStructure.push(currentList);
    }

    if (debug) {
      console.log('[QuillRenderer] Processed structure:', processedStructure);
    }

    // Now render the processed structure
    const renderedContent = processedStructure
      .map((block, blockIndex) => {
        // Render peer review ratings
        if (block.type === 'special' && block.content['peer-review-rating']) {
          return (
            <div key={`special-${blockIndex}`}>
              {renderRating(block.content['peer-review-rating'])}
            </div>
          );
        }

        // Render lists
        if (block.type === 'list') {
          const ListComponent = block.listType === 'ordered' ? 'ol' : 'ul';
          const listClass =
            block.listType === 'ordered' ? 'list-decimal pl-8 my-4' : 'list-disc pl-8 my-4';

          return (
            <ListComponent
              key={`list-${blockIndex}`}
              className={listClass}
              style={{ listStyleType: block.listType === 'ordered' ? 'decimal' : 'disc' }}
            >
              {block.items.map((item: any, itemIndex: number) => (
                <li
                  key={`item-${blockIndex}-${itemIndex}`}
                  className="mb-2"
                  value={block.listType === 'ordered' ? itemIndex + 1 : undefined}
                >
                  {item.content.map((contentItem: any, contentIndex: number) => (
                    <React.Fragment key={`content-${contentItem.index}`}>
                      {formatText(
                        contentItem.text,
                        contentItem.attributes,
                        `${blockIndex}-${itemIndex}-${contentIndex}`
                      )}
                    </React.Fragment>
                  ))}
                </li>
              ))}
            </ListComponent>
          );
        }

        // Render paragraphs
        if (block.type === 'paragraph') {
          if (block.content.length === 0) {
            return <div key={`empty-${blockIndex}`} className="h-4" />;
          }

          return (
            <p key={`p-${blockIndex}`} className="my-2">
              {block.content.map((contentItem: any, idx: number) => {
                if (contentItem.type === 'user-mention') {
                  const user = contentItem.content.user;
                  const id = user.authorProfileId || user.userId;
                  const label = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
                  return (
                    <span
                      key={`mention-${id}-${blockIndex}-${idx}`}
                      className="mention text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigateToAuthorProfile(id, true)}
                    >
                      @{label}
                    </span>
                  );
                }
                return (
                  <React.Fragment key={`content-${contentItem.index || idx}`}>
                    {formatText(contentItem.text, contentItem.attributes, `p-${blockIndex}-${idx}`)}
                  </React.Fragment>
                );
              })}
            </p>
          );
        }

        if (block.type === 'special' && block.content['user']) {
          const user = block.content['user'];
          const id = user.authorProfileId || user.userId;
          const label = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
          return (
            <span
              key={`mention-${id}-${blockIndex}`}
              className="mention text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigateToAuthorProfile(id, true)}
            >
              @{label}
            </span>
          );
        }

        return null;
      })
      .filter(Boolean);

    if (debug) {
      // Create HTML representation for debugging
      try {
        let htmlContent = '';
        let currentListType: string | null = null;
        let isInList = false;

        // Process each op and build a better HTML representation
        processedOps.forEach((op: any) => {
          if (typeof op.insert === 'string') {
            const attributes = op.attributes || {};

            // Handle list items
            if (attributes.list) {
              // Start a new list if needed
              if (!isInList || currentListType !== attributes.list) {
                // Close previous list if any
                if (isInList) {
                  htmlContent += currentListType === 'ordered' ? '</ol>' : '</ul>';
                }

                // Start new list
                htmlContent +=
                  attributes.list === 'ordered'
                    ? '<ol class="debug-ordered-list" style="list-style-type: decimal">'
                    : '<ul class="debug-bullet-list">';
                isInList = true;
                currentListType = attributes.list;
              }

              // Add list item with formatting
              let itemContent = op.insert;
              if (attributes.bold) itemContent = `<strong>${itemContent}</strong>`;
              if (attributes.italic) itemContent = `<em>${itemContent}</em>`;
              if (attributes.link) itemContent = `<a href="${attributes.link}">${itemContent}</a>`;

              htmlContent += `<li>${itemContent}</li>`;
            } else {
              // Close any open list
              if (isInList) {
                htmlContent += currentListType === 'ordered' ? '</ol>' : '</ul>';
                isInList = false;
                currentListType = null;
              }

              // Handle normal text with formatting
              let textContent = op.insert;
              if (attributes.bold) textContent = `<strong>${textContent}</strong>`;
              if (attributes.italic) textContent = `<em>${textContent}</em>`;
              if (attributes.link) textContent = `<a href="${attributes.link}">${textContent}</a>`;

              if (op.insert === '\n') {
                htmlContent += '<br/>';
              } else {
                htmlContent += `<p>${textContent}</p>`;
              }
            }
          }
        });

        // Close any remaining list
        if (isInList) {
          htmlContent += currentListType === 'ordered' ? '</ol>' : '</ul>';
        }

        console.log('[QuillRenderer] HTML representation:', htmlContent);
        console.log('[QuillRenderer] Raw Quill data:', JSON.stringify(processedOps, null, 2));
        console.log('[QuillRenderer] Processed structure:', processedStructure);
      } catch (error) {
        console.error('[QuillRenderer] Error creating HTML debug output:', error);
      }
    }

    return renderedContent;
  };

  return (
    <div className={cn('quill-document', containerClass)}>
      <style jsx global>{`
        .quill-document ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin: 1rem 0 !important;
          display: block !important;
          counter-reset: none !important;
        }
        .quill-document ol li {
          display: list-item !important;
          position: relative !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
          margin-bottom: 0.5rem !important;
        }
        .quill-document ol li::before {
          content: none !important;
        }
        .quill-document ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin: 1rem 0 !important;
          display: block !important;
        }
        .quill-document li {
          margin-bottom: 0.5rem !important;
          display: list-item !important;
        }
        .quill-document p {
          margin: 0.75rem 0 !important;
        }
        .quill-document p:last-child {
          margin-bottom: 0 !important;
        }
        .quill-document a {
          color: #3b82f6 !important;
          text-decoration: none !important;
        }
        .quill-document a:hover {
          text-decoration: underline !important;
        }
        .quill-document strong {
          font-weight: 600 !important;
        }
        .quill-document h1,
        .quill-document h2,
        .quill-document h3,
        .quill-document h4,
        .quill-document h5,
        .quill-document h6 {
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
          font-weight: 600 !important;
        }
        .quill-document h1 {
          font-size: 1.5rem !important;
        }
        .quill-document h2 {
          font-size: 1.4rem !important;
        }
        .quill-document h3 {
          font-size: 1.3rem !important;
        }
        .quill-document h4 {
          font-size: 1.2rem !important;
        }
        .quill-document h5 {
          font-size: 1.1rem !important;
        }
        .quill-document h6 {
          font-size: 1rem !important;
        }
      `}</style>
      {renderContent()}
    </div>
  );
};

export default QuillRenderer;
