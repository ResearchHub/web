'use client';

import { Loader2, Save, Trash2 } from 'lucide-react';
import { BaseSection } from '@/components/ui/BaseSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { TemplateVariableEditor } from '@/app/expert-finder/templates/components/TemplateBodyEditor';

export interface OutreachEmailContentFormValues {
  name: string;
  emailSubject: string;
  emailBody: string;
}

export interface OutreachEmailContentFormProps {
  values: OutreachEmailContentFormValues;
  onChange: (field: keyof OutreachEmailContentFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  namePlaceholder?: string;
  nameMaxLength?: number;
  /** When set, shows a destructive delete control on the left. */
  deleteLabel?: string;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  deleteTitle?: string;
  isDeleting?: boolean;
  submitLabel: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
}

export function OutreachEmailContentForm({
  values,
  onChange,
  onSubmit,
  disabled = false,
  namePlaceholder = 'e.g. NeurIPS collaboration outreach',
  nameMaxLength,
  deleteLabel,
  onDelete,
  deleteDisabled = false,
  deleteTitle,
  isDeleting = false,
  submitLabel,
  submitDisabled = false,
  isSubmitting = false,
}: OutreachEmailContentFormProps) {
  const showDelete = Boolean(deleteLabel && onDelete);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Input
        label="Name"
        value={values.name}
        onChange={(e) => {
          const next = e.target.value;
          onChange(
            'name',
            nameMaxLength != null ? next.slice(0, nameMaxLength) : next
          );
        }}
        placeholder={namePlaceholder}
        disabled={disabled}
        required
        helperText={
          nameMaxLength != null
            ? `${values.name.trim().length}/${nameMaxLength}`
            : undefined
        }
      />

      <BaseSection>
        <h3 className="text-lg font-semibold text-gray-900">Subject</h3>
        <p className="text-sm text-gray-500">
          Write the subject line and insert placeholders if needed (e.g.{' '}
          <code className="text-xs">{'{{user.*}}'}</code>,{' '}
          <code className="text-xs">{'{{expert.*}}'}</code>
          ).
        </p>
        <TemplateVariableEditor
          value={values.emailSubject}
          onChange={(value) => onChange('emailSubject', value)}
          placeholder="Invitation to collaborate with {{organization}}"
          disabled={disabled}
          singleLine
          minHeightClassName="min-h-[32px]"
        />
      </BaseSection>

      <BaseSection>
        <h3 className="text-lg font-semibold text-gray-900">Body</h3>
        <p className="text-sm text-gray-500">
          Write the outreach body and insert placeholders where personalized values should appear.
        </p>
        <TemplateVariableEditor
          value={values.emailBody}
          onChange={(value) => onChange('emailBody', value)}
          disabled={disabled}
          valueAsHtml
        />
      </BaseSection>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {showDelete ? (
          <Button
            type="button"
            variant="destructive"
            size="md"
            className="gap-2"
            onClick={onDelete}
            disabled={disabled || deleteDisabled || isDeleting}
            title={deleteTitle}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : deleteLabel}
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="submit"
          variant="default"
          size="md"
          className="gap-2"
          disabled={disabled || submitDisabled || !values.name.trim() || isSubmitting}
        >
          <Save className="h-4 w-4" aria-hidden />
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
