'use client';

import { BaseModal } from '@/components/ui/BaseModal';

interface DemoVideoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  authorName?: string;
}

/**
 * Demo-only: plays an author's "video update" in a modal, opened from the
 * corresponding notification on the notifications page.
 */
export function DemoVideoUpdateModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  authorName,
}: DemoVideoUpdateModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-semibold text-gray-900">Video update</span>
          {authorName && <span className="text-sm text-gray-500 truncate">by {authorName}</span>}
        </div>
      }
      maxWidth="max-w-2xl"
      padding="p-4"
    >
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg bg-black">
          {/* key forces the element to remount (and reload) per video */}
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[70vh]"
          />
        </div>
        {title && <p className="text-sm text-gray-600">{title}</p>}
      </div>
    </BaseModal>
  );
}
