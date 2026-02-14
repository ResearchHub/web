'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { Work } from '@/types/work';

interface Props {
  readonly work: Work;
}

export function RfpDetailCard({ work }: Props) {
  const description = work.abstract || work.previewContent || '';
  const previewImage = work.image || work.figures?.[0]?.url;
  const workHref = `/grant/${work.id}/${work.slug || ''}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Link
              href={workHref}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
            >
              {work.title}
            </Link>
          </div>
          {description && <p className="text-sm text-gray-600 line-clamp-3">{description}</p>}
        </div>
        {previewImage && (
          <div className="flex-shrink-0">
            <Image
              src={previewImage}
              alt={work.title}
              width={160}
              height={100}
              className="rounded-lg object-cover"
              style={{ width: 160, height: 100 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
