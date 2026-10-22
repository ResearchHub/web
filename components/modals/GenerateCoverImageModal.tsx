'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, RefreshCw, Sparkles } from 'lucide-react';
import {
  COVER_IMAGE_ACCEPT,
  coverImageFileError,
} from '@/components/Notebook/PublishingForm/useCoverImageUpload';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { useCoverImageGeneration } from '@/hooks/useCoverImageGeneration';
import type { GenerateCoverImagesParams } from '@/services/coverImage.service';
import type { GeneratedCoverImage } from '@/types/coverImage';
import { cn } from '@/utils/styles';

interface GenerateCoverImageModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /** What the banners show, read when the user asks to generate. */
  readonly params: GenerateCoverImagesParams;
  readonly onSelect: (image: GeneratedCoverImage) => void;
  /** Says why the modal opened, e.g. that publishing needs a cover first. */
  readonly description?: string;
}

/**
 * Generates cover image options from the work's title and details, with the
 * organization's logo placed in them when one is added, and has the user pick
 * one of them. Nothing is applied until a banner is chosen.
 */
export function GenerateCoverImageModal({
  isOpen,
  onClose,
  params,
  onSelect,
  description,
}: GenerateCoverImageModalProps) {
  const optionCount = 3;
  const { images, isGenerating, error, generate, cancel } = useCoverImageGeneration();
  const logo = useLogoUpload();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) cancel();
  }, [isOpen, cancel]);

  const hasStarted = isGenerating || images.length > 0 || error != null;
  const selected = images.find((image) => image.key === selectedKey) ?? null;

  const start = () => {
    setSelectedKey(null);
    void generate({ ...params, logoKey: logo.key });
  };

  const footer = hasStarted ? (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outlined" onClick={start} disabled={isGenerating || logo.isUploading}>
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
        Generate new options
      </Button>
      <Button onClick={() => selected && onSelect(selected)} disabled={!selected}>
        Use this cover
      </Button>
    </div>
  ) : (
    <div className="flex justify-end">
      <Button onClick={start} disabled={logo.isUploading}>
        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
        Generate covers
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" aria-hidden="true" />
          Choose a cover image
        </span>
      }
      footer={footer}
    >
      <p className="mb-4 text-sm text-gray-600">
        {description ??
          'Generate cover options from your title and details, then pick the one you want to use.'}
      </p>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {logo.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.previewUrl}
              alt="Logo"
              className="h-10 w-16 flex-shrink-0 rounded-md bg-gray-50 object-contain"
            />
          ) : (
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Logo <span className="font-normal text-gray-500">optional</span>
            </p>
            <p className={cn('text-xs', logo.error ? 'text-red-600' : 'text-gray-500')}>
              {logo.error ??
                (logo.isUploading
                  ? 'Uploading…'
                  : "Add your organization's logo to place it in the banners.")}
            </p>
          </div>
        </div>
        {logo.previewUrl ? (
          <Button variant="ghost" size="sm" onClick={logo.remove} disabled={isGenerating}>
            Remove
          </Button>
        ) : (
          <Button variant="outlined" size="sm" onClick={logo.browse} disabled={isGenerating}>
            Add logo
          </Button>
        )}
        <input {...logo.inputProps} />
      </div>

      {error && !isGenerating ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outlined" size="sm" onClick={start}>
            Try again
          </Button>
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Cover image options"
          aria-busy={isGenerating}
          className="flex flex-col gap-3"
        >
          {isGenerating
            ? Array.from({ length: optionCount }, (_, index) => (
                <Skeleton key={index} className="aspect-[3/1] w-full rounded-lg" />
              ))
            : images.map((image, index) => {
                const checked = image.key === selectedKey;
                return (
                  <button
                    key={image.key}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={`Cover option ${index + 1}`}
                    data-testid="generated-cover-option"
                    onClick={() => setSelectedKey(image.key)}
                    className={cn(
                      'relative block w-full overflow-hidden rounded-lg border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      checked
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="aspect-[3/1] w-full object-cover" />
                    {checked && (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
        </div>
      )}

      {isGenerating && (
        <p role="status" className="mt-3 text-center text-xs text-gray-500">
          Generating {optionCount} cover options. This usually takes under a minute.
        </p>
      )}
    </BaseModal>
  );
}

/**
 * The optional logo: picked with a hidden file input and uploaded at once;
 * its storage key is what generating sends.
 */
function useLogoUpload() {
  const [, uploadAsset] = useAssetUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<{ file: File; key: string | null } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const file = logo?.file ?? null;
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = ''; // allow picking the same file again
    if (!picked) return;
    const fileError = coverImageFileError(picked);
    setError(fileError);
    if (fileError) return;

    setLogo({ file: picked, key: null });
    try {
      const uploaded = await uploadAsset(picked, 'post');
      setLogo((current) =>
        current?.file === picked ? { file: picked, key: uploaded.objectKey } : current
      );
    } catch (uploadError) {
      console.error('Error uploading logo:', uploadError);
      setLogo((current) => (current?.file === picked ? null : current));
      setError('Could not upload the logo. Please try again.');
    }
  };

  return {
    key: logo?.key ?? null,
    previewUrl,
    isUploading: logo != null && logo.key == null,
    error,
    browse: () => inputRef.current?.click(),
    remove: () => {
      setLogo(null);
      setError(null);
    },
    inputProps: {
      ref: inputRef,
      type: 'file' as const,
      accept: COVER_IMAGE_ACCEPT.join(','),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void pick(event),
      className: 'hidden',
      'data-testid': 'cover-logo-input',
    },
  };
}
