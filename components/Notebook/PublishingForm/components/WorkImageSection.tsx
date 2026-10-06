import { useEffect, useRef, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Image as ImageIcon, Plus, X } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { cn } from '@/utils/styles';
import type { SectionProps } from './SectionProps';
import { PublishingFormData } from '../schema';
import {
  COVER_IMAGE_ACCEPT,
  COVER_IMAGE_MAX_MB,
  coverImageFileError,
  useCoverImageUpload,
} from '../useCoverImageUpload';

const isValidFile = (file: unknown): file is File =>
  Boolean(file instanceof File && file.name && file.size > 0);

export function WorkImageSection({ className }: SectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PublishingFormData>();

  const [error, setError] = useState<string | null>(null);
  const coverImage = useCoverImageUpload();

  return (
    <div className={cn('py-3 px-6', className)}>
      <SectionHeader icon={ImageIcon}>Cover Image</SectionHeader>
      <Controller
        name="coverImage"
        control={control}
        render={({ field }) => {
          const file = field.value?.file && isValidFile(field.value.file) ? field.value.file : null;
          const existingUrl = field.value?.url || null;

          return (
            <CoverImageControl
              file={file}
              existingUrl={existingUrl}
              error={error || (errors.coverImage?.message as string) || null}
              onSelect={(selected) => {
                setError(null);
                void coverImage.select(selected);
              }}
              onRemove={() => {
                setError(null);
                coverImage.remove();
              }}
              onError={setError}
            />
          );
        }}
      />
    </div>
  );
}

interface CoverImageControlProps {
  file: File | null;
  existingUrl: string | null;
  error: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}

function CoverImageControl({
  file,
  existingUrl,
  error,
  onSelect,
  onRemove,
  onError,
}: CoverImageControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(existingUrl);
    return undefined;
  }, [file, existingUrl]);

  const browse = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!picked) return;
    const fileError = coverImageFileError(picked);
    if (fileError) {
      onError(fileError);
      return;
    }
    onSelect(picked);
  };

  return (
    <div className="mt-2">
      {previewUrl ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Cover" className="h-full w-full object-cover" />
            </div>
            <span className="min-w-0 truncate text-sm text-gray-600">
              {file?.name ?? 'Cover image'}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove cover image"
            className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={browse}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-rhBlue-300 bg-rhBlue-50/60 px-3 py-2.5 text-sm font-medium text-rhBlue-600 transition-colors hover:border-rhBlue-400 hover:bg-rhBlue-50"
          >
            <Plus className="h-4 w-4" />
            Add cover image
          </button>
          {!error && (
            <p className="mt-1 text-xs text-gray-500">JPG or PNG · up to {COVER_IMAGE_MAX_MB}MB</p>
          )}
        </>
      )}

      <input
        data-testid="cover-image-input"
        ref={inputRef}
        type="file"
        accept={COVER_IMAGE_ACCEPT.join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
