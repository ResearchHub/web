'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

// X is the tightest of the share targets: it counts every link as 23 characters,
// and the intent joins the link to the text with a space.
const X_MAX_CHARS = 280;
const X_LINK_CHARS = 23;

// X's twitter-text weights: code points in these ranges count once, everything
// else (CJK, emoji, most symbols) twice. Mirrors the backend's check.
const X_SINGLE_WEIGHT_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x0000, 0x10ff],
  [0x2000, 0x200d],
  [0x2010, 0x201f],
  [0x2032, 0x2037],
];

const xWeightedLength = (text: string) =>
  [...text].reduce((total, char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    const single = X_SINGLE_WEIGHT_RANGES.some(
      ([low, high]) => codePoint >= low && codePoint <= high
    );
    return total + (single ? 1 : 2);
  }, 0);

interface SharePostPreviewProps {
  /** The post text, or null while it is being written. */
  text: string | null;
  /** Whether the text started as an AI draft rather than the title fallback. */
  isGenerated: boolean;
  docTitle: string;
  url: string;
  /** The image social sites show in the link's card. */
  imageUrl?: string;
  onChange: (text: string) => void;
}

/** Editable preview of the post the share modal's social buttons will open, laid out like X's composer. */
export function SharePostPreview({
  text,
  isGenerated,
  docTitle,
  url,
  imageUrl,
  onChange,
}: Readonly<SharePostPreviewProps>) {
  const { user } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const isLoading = text === null;
  const charCount = xWeightedLength(text ?? '') + 1 + X_LINK_CHARS;
  const isOverLimit = charCount > X_MAX_CHARS;
  const showImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => setImageFailed(false), [imageUrl]);

  // Grow the textarea with its content so the preview reads like a real post.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  let domain = '';
  try {
    domain = new URL(url, window.location.origin).hostname.replace(/^www\./, '');
  } catch {
    domain = 'researchhub.com';
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-left">
      <div className="flex items-start gap-3">
        <Avatar
          src={user?.authorProfile?.profileImage}
          alt={user?.fullName ?? 'You'}
          size="sm"
          disableTooltip
        />
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="space-y-2 pt-1" aria-live="polite">
              <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              <p className="flex items-center gap-1.5 pt-1 text-xs text-gray-500">
                <Sparkles className="h-3.5 w-3.5" />
                Writing your post…
              </p>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => onChange(e.target.value)}
              aria-label="Post text"
              rows={3}
              className="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-0"
            />
          )}
          <p className="break-all text-sm leading-relaxed text-[#1d9bf0]">{url}</p>

          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
            {showImage ? (
              <div className="relative aspect-[1.91/1] bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
                <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
                  {docTitle}
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 px-3 py-2">
                <p className="line-clamp-2 text-sm font-medium text-gray-900">{docTitle}</p>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">From {domain}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-500">
          {isGenerated && (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Drafted by AI · edit before sharing
            </>
          )}
        </span>
        {!isLoading && (
          <span className={cn('tabular-nums', isOverLimit ? 'text-red-600' : 'text-gray-500')}>
            {charCount}/{X_MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}

export default SharePostPreview;
