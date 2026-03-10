'use client';

import Image from 'next/image';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';

interface GrantDetailsInlineProps {
  content?: string;
  imageUrl?: string;
}

export function GrantDetailsInline({ content, imageUrl }: GrantDetailsInlineProps) {
  return (
    <div className="py-6">
      {imageUrl && (
        <div className="relative w-full h-[200px] sm:h-[280px] rounded-xl overflow-hidden bg-gray-100 mb-6">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="860px" />
        </div>
      )}

      {content ? (
        <div className="post-content max-w-[860px]">
          <PostBlockEditor
            content={content}
            className="!border-0 !shadow-none !rounded-none !p-0 !mb-0"
          />
        </div>
      ) : (
        <p className="text-gray-500 py-12 text-center">No details available for this grant.</p>
      )}
    </div>
  );
}
