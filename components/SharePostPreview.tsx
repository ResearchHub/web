'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

// X is the tightest of the share targets: it counts every link as 23 characters,
// and the intent joins the link to the text with a space.
const X_MAX_CHARS = 280;
const X_LINK_CHARS = 23;

interface SharePostPreviewProps {
  /** The post text, or null while it is being written. */
  text: string | null;
  /** Whether the text started as an AI draft rather than the title fallback. */
  isGenerated: boolean;
  docTitle: string;
  url: string;
  onChange: (text: string) => void;
}

/** Editable preview of the post the share modal's social buttons will open. */
export function SharePostPreview({
  text,
  isGenerated,
  docTitle,
  url,
  onChange,
}: SharePostPreviewProps) {
  const { user } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = text === null;
  const charCount = [...(text ?? '')].length + 1 + X_LINK_CHARS;
  const isOverLimit = charCount > X_MAX_CHARS;

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
          <span className="block truncate text-sm font-semibold text-gray-900">
            {user?.fullName ?? 'You'}
          </span>

          {isLoading ? (
            <div className="mt-2 space-y-2" aria-live="polite">
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
              className="mt-1 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-0"
            />
          )}

          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">{domain}</p>
            <p className="line-clamp-2 text-sm font-medium text-gray-900">{docTitle}</p>
          </div>
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
