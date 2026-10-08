'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import {
  COVER_IMAGE_ACCEPT,
  coverImageFileError,
  useCoverImageUpload,
} from '@/components/Notebook/PublishingForm/useCoverImageUpload';

/**
 * The cover image has no editing state: a click opens the file picker, the
 * pick shows at once and uploads behind it. Two places start that click, the
 * byline's offer to add one and the banner once there is one, so the picker
 * is held here and its hidden input rendered once by the masthead.
 */
export function useCoverImagePicker(value: PublishingFormData['coverImage']) {
  const { select, remove } = useCoverImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const file = value?.file instanceof File ? value.file : null;
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const browse = useCallback(() => inputRef.current?.click(), []);
  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = ''; // allow picking the same file again
    if (!picked) return;
    const fileError = coverImageFileError(picked);
    setError(fileError);
    if (!fileError) void select(picked);
  };

  return {
    /** The picture to show: the pick while it uploads, then what the server stored. */
    imageUrl: fileUrl ?? value?.url ?? null,
    /** Why the last pick was refused, if it was. */
    error,
    browse,
    remove: () => {
      setError(null);
      remove();
    },
    inputProps: {
      ref: inputRef,
      type: 'file' as const,
      accept: COVER_IMAGE_ACCEPT.join(','),
      onChange: handlePick,
      className: 'hidden',
      'data-testid': 'masthead-cover-input',
    },
  };
}

interface CoverBannerProps {
  readonly imageUrl: string;
  /** Opens the file picker to replace it; absent where the cover cannot be changed. */
  readonly onChange?: () => void;
  readonly onRemove?: () => void;
}

/** The cover image across the column, above the title, as the published page shows it. */
export function CoverBanner({ imageUrl, onChange, onRemove }: CoverBannerProps) {
  // eslint-disable-next-line @next/next/no-img-element
  const image = <img src={imageUrl} alt="" className="h-[170px] w-full object-cover" />;

  if (!onChange) {
    return <div className="mb-1 overflow-hidden rounded-[10px] bg-gray-100">{image}</div>;
  }
  return (
    <div className="group relative mb-1">
      <button
        type="button"
        onClick={onChange}
        aria-label="Change the cover image"
        title="Change the cover image"
        className="block w-full overflow-hidden rounded-[10px] bg-gray-100 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40"
      >
        {image}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove the cover image"
          title="Remove the cover image"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-sm transition hover:bg-white hover:text-gray-900 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
