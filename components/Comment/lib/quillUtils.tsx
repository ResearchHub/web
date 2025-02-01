interface PeerReviewRating {
  rating: number;
  category: string;
}

// Utility function to convert Quill Delta to HTML
export const convertDeltaToHTML = (delta: { ops: any[] }) => {
  // Basic conversion of Quill Delta to HTML
  return delta.ops.reduce((html, op) => {
    if (typeof op.insert === 'string') {
      let text = op.insert;
      // Handle newlines
      text = text.replace(/\n/g, '<br />');
      if (op.attributes) {
        if (op.attributes.bold) text = `<strong>${text}</strong>`;
        if (op.attributes.italic) text = `<em>${text}</em>`;
        if (op.attributes.underline) text = `<u>${text}</u>`;
        if (op.attributes.strike) text = `<s>${text}</s>`;
        if (op.attributes.code) text = `<code>${text}</code>`;
        if (op.attributes.link) text = `<a href="${op.attributes.link}">${text}</a>`;
      }
      return html + text;
    } else if (op.insert && typeof op.insert === 'object') {
      if (op.insert.image) {
        return html + `<img src="${op.insert.image}" />`;
      } else if (op.insert.video) {
        return (
          html +
          `<div class="video-embed"><iframe src="${op.insert.video}" frameborder="0" allowfullscreen></iframe></div>`
        );
      } else if (op.insert['peer-review-rating']) {
        const rating = op.insert['peer-review-rating'] as PeerReviewRating;
        return (
          html +
          `<div class="peer-review-rating">
          <div class="rating-category">${rating.category}</div>
          <div class="rating-value">${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</div>
        </div>`
        );
      }
    }
    return html;
  }, '');
};
