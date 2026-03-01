'use client';

import { useState, useMemo } from 'react';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';

function stripHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.textContent || '';
  }
  return html.replace(/<[^>]*>/g, '');
}

interface GrantDetailsCalloutProps {
  content: string;
}

export const GrantDetailsCallout = ({ content }: GrantDetailsCalloutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = useMemo(() => {
    const plain = stripHtml(content).trim();
    return plain.length > 200 ? plain.slice(0, 200).trimEnd() : plain;
  }, [content]);
  const isTruncated = stripHtml(content).trim().length > 200;

  if (isExpanded) {
    return (
      <div className="mt-4">
        <PostBlockEditor content={content} />
        <button
          onClick={() => setIsExpanded(false)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          Show less
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsExpanded(true)}
      className="mt-4 w-full text-left rounded-xl bg-gray-100/75 hover:bg-gray-200 transition-colors duration-150 px-4 py-3 cursor-pointer"
    >
      <span className="text-sm font-semibold text-gray-900">Funding details</span>
      <p className="text-sm text-gray-700 leading-relaxed mt-1">
        {preview}
        {isTruncated && <span className="text-sm font-bold text-gray-900 ml-0.5">...more</span>}
      </p>
    </button>
  );
};
