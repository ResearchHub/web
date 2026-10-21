'use client';

import { useEffect, useState } from 'react';
import { Check, RefreshCw, Sparkles } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCoverImageGeneration } from '@/hooks/useCoverImageGeneration';
import type { GenerateCoverImagesParams } from '@/services/coverImage.service';
import type { GeneratedCoverImage } from '@/types/coverImage';
import { cn } from '@/utils/styles';

const OPTION_COUNT = 3;

interface GenerateCoverImageModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /** What the banners show; generating starts each time the modal opens. */
  readonly params: GenerateCoverImagesParams;
  readonly onSelect: (image: GeneratedCoverImage) => void;
  /** Says why the modal opened, e.g. that publishing needs a cover first. */
  readonly description?: string;
}

/**
 * Generates cover image options from the work's title and details and has
 * the user pick one of them. Nothing is applied until a banner is chosen.
 */
export function GenerateCoverImageModal({
  isOpen,
  onClose,
  params,
  onSelect,
  description,
}: GenerateCoverImageModalProps) {
  const { images, isGenerating, error, generate, cancel } = useCoverImageGeneration();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const start = () => {
    setSelectedKey(null);
    void generate(params);
  };

  useEffect(() => {
    if (isOpen) start();
    else cancel();
    // Generate once per opening, with the details as they are then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selected = images.find((image) => image.key === selectedKey) ?? null;

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outlined" onClick={start} disabled={isGenerating}>
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
        Generate new options
      </Button>
      <Button onClick={() => selected && onSelect(selected)} disabled={!selected}>
        Use this cover
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
          'We generated cover options from your title and details. Pick the one you want to use.'}
      </p>

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
            ? Array.from({ length: OPTION_COUNT }, (_, index) => (
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
          Generating {OPTION_COUNT} cover options. This usually takes about a minute.
        </p>
      )}
    </BaseModal>
  );
}
