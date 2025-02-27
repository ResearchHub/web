import { ContentFormat, Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import React, { useEffect, ReactNode, useState } from 'react';
import { convertQuillDeltaToTipTap } from '@/lib/convertQuillDeltaToTipTap';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Star } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CommentReadOnlyProps {
  content?: any;
  comment?: Comment;
  contentFormat?: ContentFormat;
  contentType?: ContentType;
}

// Simple read-only stars component for displaying review score
const ReadOnlyStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Review section header component
const ReviewSectionHeader = ({
  title,
  description,
  rating,
}: {
  title: string;
  description: string;
  rating: number;
}) => {
  return (
    <div className="mb-4 border-b pb-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <ReadOnlyStars rating={rating} />
      </div>
      {description && <p className="text-sm text-gray-600 italic">{description}</p>}
    </div>
  );
};

export const CommentReadOnly = ({
  content,
  comment,
  contentFormat = 'TIPTAP',
  contentType,
}: CommentReadOnlyProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use content prop if provided, otherwise safely access comment?.content
  const contentToRender = content || comment?.content;
  const formatToUse = contentFormat || comment?.contentFormat || 'TIPTAP';

  useEffect(() => {
    // Find all pre code blocks and apply highlighting
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [contentToRender]);

  const renderTextWithMarks = (text: string, attrs: any) => {
    let formattedText: ReactNode = text;
    if (attrs.bold) formattedText = <strong>{formattedText}</strong>;
    if (attrs.italic) formattedText = <em>{formattedText}</em>;
    if (attrs.link) {
      formattedText = (
        <a href={attrs.link} className="text-blue-600">
          {formattedText}
        </a>
      );
    }
    return formattedText;
  };

  const renderQuillContent = (quillContent: any) => {
    if (!quillContent.ops) return null;

    const result: ReactNode[] = [];
    let currentListItems: ReactNode[] = [];
    let isInList = false;
    let listType: 'ordered' | 'bullet' | null = null;
    let currentParagraph: ReactNode[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        result.push(<p className="my-4">{currentParagraph}</p>);
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentListItems.length > 0) {
        result.push(
          listType === 'ordered' ? (
            <ol className="list-decimal pl-8 my-4">{currentListItems}</ol>
          ) : (
            <ul className="list-disc pl-8 my-4">{currentListItems}</ul>
          )
        );
        currentListItems = [];
        isInList = false;
        listType = null;
      }
    };

    for (let i = 0; i < quillContent.ops.length; i++) {
      const op = quillContent.ops[i];
      const text = op.insert;
      const attrs = op.attributes || {};

      if (typeof text === 'string') {
        if (text === '\n') {
          // Handle line break
          if (attrs.list) {
            // End of list item
            if (currentParagraph.length > 0) {
              currentListItems.push(<li className="pl-1.5">{currentParagraph}</li>);
              currentParagraph = [];
            }
            listType = attrs.list;
            isInList = true;
          } else {
            // End of paragraph
            if (isInList) {
              flushList();
            } else {
              flushParagraph();
            }
          }
        } else {
          // Handle text content
          const parts = text.split('\n');
          parts.forEach((part, index) => {
            if (part.length > 0) {
              const formattedText = renderTextWithMarks(part, attrs);
              currentParagraph.push(formattedText);
            }

            if (index < parts.length - 1) {
              // Handle line break within text
              if (attrs.list) {
                if (currentParagraph.length > 0) {
                  currentListItems.push(<li className="pl-1.5">{currentParagraph}</li>);
                  currentParagraph = [];
                }
                listType = attrs.list;
                isInList = true;
              } else {
                if (isInList) {
                  flushList();
                }
                flushParagraph();
              }
            }
          });
        }
      }
    }

    // Flush any remaining content
    if (isInList) {
      if (currentParagraph.length > 0) {
        currentListItems.push(<li className="pl-1.5">{currentParagraph}</li>);
      }
      flushList();
    } else {
      flushParagraph();
    }

    return result;
  };

  const renderTipTapContent = (tipTapContent: any) => {
    if (!tipTapContent.content) return null;

    let currentList: ReactNode[] = [];
    let isInList = false;
    let listType: 'ordered' | 'bullet' | null = null;

    const result = [];

    for (let i = 0; i < tipTapContent.content.length; i++) {
      const node = tipTapContent.content[i];

      if (node.type === 'sectionHeader') {
        // Render review section header
        result.push(
          <ReviewSectionHeader
            key={`section-${i}`}
            title={node.attrs.title}
            description={node.attrs.description}
            rating={node.attrs.rating}
          />
        );
      } else if (node.type === 'paragraph') {
        if (isInList) {
          // End current list
          result.push(
            listType === 'ordered' ? (
              <ol key={`list-${i}`} className="list-decimal">
                {currentList}
              </ol>
            ) : (
              <ul key={`list-${i}`} className="list-disc">
                {currentList}
              </ul>
            )
          );
          currentList = [];
          isInList = false;
          listType = null;
        }

        result.push(
          <p key={i}>
            {node.content?.map((textNode: any, textIndex: number) =>
              renderTextWithMarks(textNode.text || '', textNode.marks || {})
            )}
          </p>
        );
      } else if (node.type === 'code_block') {
        result.push(
          <pre key={i}>
            <code className={`language-${node.attrs?.language || 'javascript'}`}>
              {node.content?.[0]?.text || ''}
            </code>
          </pre>
        );
      } else if (node.type === 'mention') {
        result.push(
          <a
            key={i}
            href={`/profile/${node.attrs.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            @{node.attrs.label}
          </a>
        );
      } else if (node.type === 'list_item') {
        isInList = true;
        listType = node.attrs?.type || 'bullet';
        currentList.push(
          <li key={`item-${i}`}>
            {node.content?.map((textNode: any, textIndex: number) =>
              renderTextWithMarks(textNode.text || '', textNode.marks || {})
            )}
          </li>
        );

        // If this is the last node or the next node is not a list item, end the list
        if (
          i === tipTapContent.content.length - 1 ||
          tipTapContent.content[i + 1].type !== 'list_item'
        ) {
          result.push(
            listType === 'ordered' ? (
              <ol key={`list-${i}`} className="list-decimal">
                {currentList}
              </ol>
            ) : (
              <ul key={`list-${i}`} className="list-disc">
                {currentList}
              </ul>
            )
          );
          currentList = [];
          isInList = false;
          listType = null;
        }
      }
    }

    return result;
  };

  const getTextContent = (node: ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (!node) return '';
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (React.isValidElement(node)) {
      return getTextContent(node.props.children);
    }
    return '';
  };

  const truncateContent = (nodes: ReactNode[]): ReactNode[] => {
    if (!isExpanded) {
      let totalLength = 0;
      const truncatedNodes: ReactNode[] = [];
      let shouldBreak = false;

      for (const node of nodes) {
        if (shouldBreak) break;

        if (React.isValidElement(node)) {
          const nodeText = getTextContent(node.props.children);
          const newLength = totalLength + nodeText.length;

          if (newLength <= 200) {
            truncatedNodes.push(node);
            totalLength = newLength;
          } else {
            // We need to truncate this node
            const remainingChars = 200 - totalLength;

            // Handle paragraph nodes
            if (node.type === 'p') {
              const children = React.Children.toArray(node.props.children);
              const truncatedChildren: ReactNode[] = [];
              let childLength = 0;

              for (const child of children) {
                const childText = getTextContent(child);
                const newChildLength = childLength + childText.length;

                if (newChildLength <= remainingChars) {
                  truncatedChildren.push(child);
                  childLength = newChildLength;
                } else {
                  // Need to truncate this child
                  const remainingChildChars = remainingChars - childLength;
                  if (typeof child === 'string') {
                    truncatedChildren.push(child.slice(0, remainingChildChars) + '...');
                  } else if (React.isValidElement(child)) {
                    const originalText = getTextContent(child.props.children);
                    const truncatedText = originalText.slice(0, remainingChildChars) + '...';
                    truncatedChildren.push(React.cloneElement(child, {}, truncatedText));
                  }
                  break;
                }
              }

              truncatedNodes.push(React.cloneElement(node, {}, truncatedChildren));
            } else {
              // For non-paragraph nodes, try to preserve the original structure
              const originalText = getTextContent(node.props.children);
              const truncatedText = originalText.slice(0, remainingChars) + '...';
              truncatedNodes.push(React.cloneElement(node, {}, truncatedText));
            }
            shouldBreak = true;
          }
        } else {
          truncatedNodes.push(node);
        }
      }
      return truncatedNodes;
    }
    return nodes;
  };

  const getFormattedContent = () => {
    if (!contentToRender) return null;

    let renderedContent: ReactNode[] = [];
    switch (formatToUse) {
      case 'QUILL_EDITOR': {
        const parsedContent =
          typeof contentToRender === 'string' ? JSON.parse(contentToRender) : contentToRender;
        const quillContent = renderQuillContent(parsedContent);
        if (quillContent) renderedContent = quillContent;
        break;
      }
      case 'TIPTAP': {
        const parsedContent =
          typeof contentToRender === 'string' ? JSON.parse(contentToRender) : contentToRender;
        const tipTapContent = renderTipTapContent(parsedContent);
        if (tipTapContent) renderedContent = tipTapContent;
        break;
      }
      default:
        renderedContent = [<p key="default">{String(contentToRender)}</p>];
    }

    if (renderedContent.length === 0) return null;

    const truncatedContent = truncateContent(renderedContent);
    const shouldShowReadMore =
      renderedContent.length > truncatedContent.length ||
      (renderedContent[0] &&
        React.isValidElement(renderedContent[0]) &&
        renderedContent[0].props.children?.toString().length > 200);

    return (
      <>
        {isExpanded ? renderedContent : truncatedContent}
        {shouldShowReadMore && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-0.5 mt-1"
          >
            {isExpanded ? 'Show less' : 'Read more'}
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                isExpanded && 'transform rotate-180'
              )}
            />
          </Button>
        )}
      </>
    );
  };

  return (
    <div>
      <style jsx global>{`
        /* Comment Content Styles */
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }

        .prose blockquote p {
          margin: 0;
        }

        .prose blockquote blockquote {
          border-left-color: #d1d5db;
          margin-left: 0.5rem;
        }

        /* List styles */
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose li {
          margin: 0.5rem 0;
        }

        .prose li > ul,
        .prose li > ol {
          margin: 0.5rem 0;
        }

        /* Code block styles */
        .prose pre {
          background-color: rgb(40, 44, 52);
          color: rgb(171, 178, 191);
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .prose pre code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
            'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          background: none;
          padding: 0;
          margin: 0;
          border-radius: 0;
          box-shadow: none;
        }

        /* Import highlight.js theme */
        @import 'highlight.js/styles/atom-one-dark.css';
      `}</style>

      {/* Comment Content */}
      <div className="prose prose-sm max-w-none">{getFormattedContent()}</div>
    </div>
  );
};
