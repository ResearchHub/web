interface PeerReviewRating {
  rating: number;
  category: string;
}

interface QuillMention {
  id: string;
  value: string;
  denotationChar: string;
  authorProfileId?: string;
}

// Utility function to convert Quill Delta to HTML
export const convertDeltaToHTML = (delta: { ops: any[] }) => {
  // Basic conversion of Quill Delta to HTML
  let html = '';
  let inList = false;
  let listType: 'bullet' | 'ordered' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      const listTag = listType === 'ordered' ? 'ol' : 'ul';
      html += `<${listTag}>${listItems.join('')}</${listTag}>`;
      listItems = [];
      inList = false;
      listType = null;
    }
  };

  delta.ops.forEach((op) => {
    if (typeof op.insert === 'string') {
      let text = op.insert;
      const attributes = op.attributes || {};

      // Handle list items
      if (attributes.list) {
        if (!inList || listType !== attributes.list) {
          // Flush any current list
          flushList();
          inList = true;
          listType = attributes.list;
        }

        // Format text with inline attributes
        if (attributes.bold) text = `<strong>${text}</strong>`;
        if (attributes.italic) text = `<em>${text}</em>`;
        if (attributes.underline) text = `<u>${text}</u>`;
        if (attributes.strike) text = `<s>${text}</s>`;
        if (attributes.code) text = `<code>${text}</code>`;
        if (attributes.link) text = `<a href="${attributes.link}">${text}</a>`;

        // Add to list items
        listItems.push(`<li>${text}</li>`);
      } else {
        // Flush any current list
        if (inList) {
          flushList();
        }

        // Handle newlines
        if (text === '\n') {
          html += '<br />';
        } else {
          // Apply inline formatting
          if (attributes.bold) text = `<strong>${text}</strong>`;
          if (attributes.italic) text = `<em>${text}</em>`;
          if (attributes.underline) text = `<u>${text}</u>`;
          if (attributes.strike) text = `<s>${text}</s>`;
          if (attributes.code) text = `<code>${text}</code>`;
          if (attributes.link) text = `<a href="${attributes.link}">${text}</a>`;
          html += text;
        }
      }
    } else if (op.insert && typeof op.insert === 'object') {
      // Flush any current list before inserting special objects
      if (inList) {
        flushList();
      }

      if (op.insert.image) {
        html += `<img src="${op.insert.image}" />`;
      } else if (op.insert.video) {
        html += `<div class="video-embed"><iframe src="${op.insert.video}" frameborder="0" allowfullscreen></iframe></div>`;
      } else if (op.insert['peer-review-rating']) {
        const rating = op.insert['peer-review-rating'] as PeerReviewRating;
        html += `<div class="peer-review-rating">
          <div class="rating-category">${rating.category}</div>
          <div class="rating-value">${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</div>
        </div>`;
      } else if (op.insert.mention) {
        const mention = op.insert.mention as QuillMention;
        html += `<span class="mention" data-user-id="${mention.id}" data-author-profile-id="${mention.authorProfileId || ''}">${mention.denotationChar}${mention.value}</span>`;
      }
    }
  });

  // Flush any remaining list
  flushList();

  return html;
};
