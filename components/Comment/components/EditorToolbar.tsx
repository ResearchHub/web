import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/Button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReviewCategory } from '../lib/ReviewCategories';
import { cn } from '@/utils/styles';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code2,
  Quote,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  AtSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ReviewCategories } from '../lib/ReviewCategories';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  tooltip: string;
  className?: string;
  inDropdown?: boolean;
  children: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  isActive,
  tooltip,
  className = '',
  inDropdown = false,
  children,
}: ToolbarButtonProps) => (
  <Button
    onClick={onClick}
    variant={isActive ? 'secondary' : 'ghost'}
    size="sm"
    tooltip={tooltip}
    className={className}
  >
    {children}
  </Button>
);

interface ToolbarDividerProps {
  inDropdown?: boolean;
}

const ToolbarDivider = ({ inDropdown = false }: ToolbarDividerProps) => {
  if (inDropdown) return null;
  return <div className="w-px h-8 bg-gray-200 shrink-0" />;
};

interface FormattingButtonsProps {
  editor: Editor;
  inDropdown?: boolean;
}

const FormattingButtons = ({ editor, inDropdown = false }: FormattingButtonsProps) => {
  const buttonClasses = inDropdown ? 'w-full justify-start px-3 py-2' : '';

  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Bold"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <Bold className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Bold</span>}
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Italic"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <Italic className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Italic</span>}
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        tooltip="Underline"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <UnderlineIcon className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Underline</span>}
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip="Strikethrough"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <Strikethrough className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Strikethrough</span>}
      </ToolbarButton>
    </>
  );
};

interface BlockButtonsProps {
  editor: Editor;
  inDropdown?: boolean;
}

const BlockButtons = ({ editor, inDropdown = false }: BlockButtonsProps) => {
  const buttonClasses = inDropdown ? 'w-full justify-start px-3 py-2' : '';

  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        tooltip="Code Block"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <Code2 className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Code Block</span>}
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip="Quote"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <Quote className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Quote</span>}
      </ToolbarButton>
    </>
  );
};

interface ListButtonsProps {
  editor: Editor;
  inDropdown?: boolean;
}

const ListButtons = ({ editor, inDropdown = false }: ListButtonsProps) => {
  const buttonClasses = inDropdown ? 'w-full justify-start px-3 py-2' : '';

  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        tooltip="Bullet List"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <List className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Bullet List</span>}
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        tooltip="Numbered List"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <ListOrdered className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Numbered List</span>}
      </ToolbarButton>
    </>
  );
};

interface InsertButtonsProps {
  editor: Editor;
  onLinkAdd: () => void;
  onImageAdd: () => void;
  showMentions?: boolean;
  inDropdown?: boolean;
}

const InsertButtons = ({
  editor,
  onLinkAdd,
  onImageAdd,
  showMentions = true,
  inDropdown = false,
}: InsertButtonsProps) => {
  const buttonClasses = inDropdown ? 'w-full justify-start px-3 py-2' : '';

  return (
    <>
      <ToolbarButton
        onClick={onLinkAdd}
        isActive={editor.isActive('link')}
        tooltip="Add Link"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <Link2 className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Add Link</span>}
      </ToolbarButton>

      <ToolbarButton
        onClick={onImageAdd}
        tooltip="Add Image"
        className={buttonClasses}
        inDropdown={inDropdown}
      >
        <ImageIcon className="h-4 w-4" />
        {inDropdown && <span className="ml-2">Add Image</span>}
      </ToolbarButton>

      {showMentions && (
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().insertContent('@').run();
          }}
          tooltip="Mention"
          className={buttonClasses}
          inDropdown={inDropdown}
        >
          <AtSign className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Mention</span>}
        </ToolbarButton>
      )}
    </>
  );
};

interface EditorToolbarProps {
  editor: Editor;
  onLinkAdd: () => void;
  onImageAdd: () => void;
  onAddReviewCategory?: (category: ReviewCategory) => void;
  isReview?: boolean;
  isReadOnly?: boolean;
  compactToolbar?: boolean;
  showMentions?: boolean;
}

export const EditorToolbar = ({
  editor,
  onLinkAdd,
  onImageAdd,
  onAddReviewCategory,
  isReview = false,
  isReadOnly = false,
  compactToolbar = false,
  showMentions = true,
}: EditorToolbarProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if toolbar can scroll
  const checkToolbarScroll = useCallback(() => {
    if (toolbarRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  }, []);

  // Update scroll indicators when toolbar content changes
  useEffect(() => {
    checkToolbarScroll();

    // Add resize observer to check scroll when window resizes
    const resizeObserver = new ResizeObserver(() => {
      checkToolbarScroll();
    });

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkToolbarScroll]);

  // Add scroll event listener to toolbar
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (toolbar) {
      toolbar.addEventListener('scroll', checkToolbarScroll);
      return () => {
        toolbar.removeEventListener('scroll', checkToolbarScroll);
      };
    }
  }, [checkToolbarScroll]);

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'flex items-center border-b border-gray-200 px-2 py-1 overflow-x-auto',
        compactToolbar ? 'gap-1' : 'gap-2'
      )}
    >
      {/* Scroll left button */}
      {canScrollLeft && (
        <button
          type="button"
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100"
          onClick={() => {
            if (toolbarRef.current) {
              toolbarRef.current.scrollBy({ left: -100, behavior: 'smooth' });
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Formatting buttons */}
      <FormattingButtons editor={editor} />
      <ToolbarDivider />

      {/* Block buttons */}
      <BlockButtons editor={editor} />
      <ToolbarDivider />

      {/* List buttons */}
      <ListButtons editor={editor} />
      <ToolbarDivider />

      {/* Insert buttons */}
      <InsertButtons
        editor={editor}
        onLinkAdd={onLinkAdd}
        onImageAdd={onImageAdd}
        showMentions={showMentions}
      />

      {/* Review categories */}
      {isReview && onAddReviewCategory && (
        <>
          <ToolbarDivider />
          <ReviewCategories onSelectCategory={onAddReviewCategory} disabled={isReadOnly} />
        </>
      )}

      {/* Scroll right button */}
      {canScrollRight && (
        <button
          type="button"
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100"
          onClick={() => {
            if (toolbarRef.current) {
              toolbarRef.current.scrollBy({ left: 100, behavior: 'smooth' });
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
