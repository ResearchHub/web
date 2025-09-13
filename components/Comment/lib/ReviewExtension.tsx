import { Node, Extension, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { Ban, Star } from 'lucide-react';
import { useState } from 'react';

// Common ReviewStars component used by both overall and section ratings
export const ReviewStars = ({
  rating,
  onRatingChange,
  isRequired = false,
  isReadOnly = false,
  isClearable = false,
  label = 'Overall rating:',
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isClearable?: boolean;
  label?: string;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {label && <div className="text-sm text-gray-700 mr-2 flex items-center">{label}</div>}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isReadOnly}
            onClick={() => !isReadOnly && onRatingChange(star)}
            onMouseEnter={() => !isReadOnly && setHoverRating(star)}
            onMouseLeave={() => !isReadOnly && setHoverRating(0)}
            className={`${
              isReadOnly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-500'
            } transition-colors ${
              star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        {isClearable && (
          <button
            type="button"
            onClick={() => onRatingChange(0)}
            className={`pl-2 cursor-pointer hover:text-red-500 transition-colors ${
              rating ? 'text-red-200' : 'text-gray-300'
            }`}
          >
            <Ban className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Section Header Node
interface SectionHeaderAttributes {
  sectionId: string;
  title: string;
  description: string;
  rating: number;
}

const SectionHeaderComponent = ({ node, updateAttributes }: any) => {
  return (
    <NodeViewWrapper>
      <div className="mb-2" data-section-id={node.attrs.sectionId}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{node.attrs.title}</h3>
          <div className="ml-4">
            <ReviewStars
              rating={node.attrs.rating}
              onRatingChange={(newRating) => updateAttributes({ rating: newRating })}
              isRequired={true}
              label=""
            />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const SectionHeaderNode = Node.create({
  name: 'sectionHeader',
  group: 'block',
  atom: true,
  draggable: false,
  selectable: false,

  addAttributes() {
    return {
      sectionId: { default: null },
      title: { default: null },
      description: { default: null },
      rating: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-section-header]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-section-header': '' }, HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionHeaderComponent);
  },
});

// Main Review Extension
interface ReviewOptions {
  rating: number;
  onRatingChange: (rating: number) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    review: {
      setRating: (rating: number) => ReturnType;
      setSectionHeader: (attributes: SectionHeaderAttributes) => ReturnType;
    };
  }
}

export const ReviewExtension = Extension.create<ReviewOptions>({
  name: 'review',

  addOptions() {
    return {
      rating: 0,
      onRatingChange: () => {},
    };
  },

  addExtensions() {
    return [SectionHeaderNode];
  },

  addCommands() {
    return {
      setRating:
        (rating: number) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            this.options.onRatingChange(rating);
          }
          return true;
        },
      setSectionHeader:
        (attributes: SectionHeaderAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: 'sectionHeader',
            attrs: attributes,
          });
        },
    };
  },
});
