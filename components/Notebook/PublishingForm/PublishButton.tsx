'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { usePublishingController, type PublishingController } from './PublishingFormProvider';

const publishLabel = ({
  readOnly,
  isUpserting,
  isLinkingNonprofit,
  isRedirecting,
}: PublishingController): string => {
  if (readOnly) return 'Published';
  if (isUpserting) return 'Publishing...';
  if (isLinkingNonprofit) return 'Linking nonprofit...';
  if (isRedirecting) return 'Redirecting...';
  return 'Publish';
};

interface PublishButtonProps {
  readonly className?: string;
}

/** Starts the publish flow for the note the surrounding provider holds. */
export function PublishButton({ className }: PublishButtonProps) {
  const controller = usePublishingController();

  return (
    <Button
      data-testid="publishing-form-submit"
      variant="default"
      onClick={controller.requestPublish}
      className={cn('disabled:opacity-50 disabled:cursor-not-allowed', className)}
      disabled={!controller.canPublish}
    >
      {publishLabel(controller)}
    </Button>
  );
}
