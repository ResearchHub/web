'use client';

import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { usePublishingCompletion } from './completion';
import { usePublishingController, type PublishingController } from './PublishingFormProvider';

const publishLabel = ({
  readOnly,
  isUpserting,
  isLinkingNonprofit,
  isRedirecting,
  isPublished,
}: PublishingController): string => {
  if (readOnly) return 'Published';
  if (isUpserting) return 'Publishing...';
  if (isLinkingNonprofit) return 'Linking nonprofit...';
  if (isRedirecting) return 'Redirecting...';
  return isPublished ? 'Update' : 'Publish';
};

interface PublishButtonProps {
  /**
   * Stay disabled until every required detail is filled in. Without it the
   * click validates and names what is missing, which suits a form the user
   * is looking at; with it the button reads as the last step of a checklist.
   */
  readonly requireComplete?: boolean;
  readonly size?: ComponentProps<typeof Button>['size'];
  readonly className?: string;
}

/** Starts the publish flow for the note the surrounding provider holds. */
export function PublishButton({ requireComplete = false, size, className }: PublishButtonProps) {
  const controller = usePublishingController();
  const { isComplete } = usePublishingCompletion();
  const blockedByChecklist = requireComplete && !isComplete && !controller.isPublished;

  return (
    <Button
      data-testid="publishing-form-submit"
      variant="default"
      size={size}
      onClick={controller.requestPublish}
      title={blockedByChecklist ? 'Finish the remaining details to publish' : undefined}
      className={cn('disabled:opacity-50 disabled:cursor-not-allowed', className)}
      disabled={!controller.canPublish || blockedByChecklist}
    >
      {publishLabel(controller)}
    </Button>
  );
}
