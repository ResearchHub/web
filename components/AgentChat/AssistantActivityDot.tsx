import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';

interface AssistantActivityDotProps {
  /**
   * `working` flashes while the assistant is at work; `review` stands still
   * while its changes wait to be accepted or rejected.
   */
  readonly state: 'working' | 'review';
  readonly className?: string;
}

const LABEL: Record<AssistantActivityDotProps['state'], string> = {
  working: 'The assistant is working on this document',
  review: 'The assistant’s changes are ready to review',
};

/** The one sign that the assistant is at work: on a document, and on a chat's row in History. */
export function AssistantActivityDot({ state, className }: AssistantActivityDotProps) {
  return (
    <span
      role="status"
      aria-label={LABEL[state]}
      title={LABEL[state]}
      className={cn('inline-flex', className)}
    >
      <RadiatingDot ring size="md" color="bg-primary-500" isRadiating={state === 'working'} />
    </span>
  );
}
