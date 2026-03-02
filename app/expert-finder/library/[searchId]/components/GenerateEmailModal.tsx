'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { useSavedTemplates } from '@/hooks/useExpertFinder';
import { cn } from '@/utils/styles';
import type { ExpertResult } from '@/types/expertFinder';
import type { EmailTemplateKind } from '@/services/expertFinder.service';

interface GenerateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experts: ExpertResult[];
  searchId: string;
  searchName?: string;
  onConfirm: (template: string, templateId: number | null) => void;
}

export interface EmailTemplateOption {
  value: EmailTemplateKind;
  label: string;
  description: string;
}

export const EMAIL_TEMPLATE_OPTIONS: EmailTemplateOption[] = [
  {
    value: 'collaboration',
    label: 'Collaboration Opportunity',
    description: 'Propose a research partnership, joint project, or co-authored work',
  },
  {
    value: 'consultation',
    label: 'Expert Consultation',
    description: 'Request their advice, guidance, or input on a specific topic',
  },
  {
    value: 'conference',
    label: 'Event Invitation',
    description: 'Invite them to speak at a conference, symposium, or panel discussion',
  },
  {
    value: 'peer-review',
    label: 'Review Request',
    description: 'Ask them to review a manuscript, proposal, or other work',
  },
  {
    value: 'publication',
    label: 'Publication Opportunity',
    description: 'Invite them to contribute to a journal, book, or publication',
  },
  {
    value: 'rfp-outreach',
    label: 'Call for Proposals',
    description: 'Invite them to submit proposals and share with their network',
  },
  {
    value: 'custom',
    label: 'Custom Message',
    description: 'Write your own purpose or use case for the email',
  },
];

/** Resolve template value to display label (e.g. "rfp-outreach" → "Call for Proposals"). Unknown values return "Unknown". */
export function getTemplateDisplayLabel(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '—';
  const opt = EMAIL_TEMPLATE_OPTIONS.find((o) => o.value === value.trim());
  return opt ? opt.label : 'Unknown';
}

/** Resolve template value to description (for tooltips). Returns empty string for unknown or empty. */
export function getTemplateDescription(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '';
  const opt = EMAIL_TEMPLATE_OPTIONS.find((o) => o.value === value.trim());
  return opt ? opt.description : '';
}

const RADIO_OPTIONS = EMAIL_TEMPLATE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
  description: opt.description,
}));

const CUSTOM_PLACEHOLDER =
  'e.g. Invitation to join an advisory board for a new research initiative';

export function GenerateEmailModal({
  isOpen,
  onClose,
  experts,
  searchId,
  searchName,
  onConfirm,
}: GenerateEmailModalProps) {
  const [purpose, setPurpose] = useState<EmailTemplateKind>(
    RADIO_OPTIONS[0]?.value ?? 'collaboration'
  );
  const [customUseCase, setCustomUseCase] = useState('');
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [{ templates }] = useSavedTemplates({ limit: 100, immediate: isOpen });

  useEffect(() => {
    if (isOpen) {
      setPurpose(RADIO_OPTIONS[0]?.value ?? 'collaboration');
      setCustomUseCase('');
      setTemplateId(null);
    }
  }, [isOpen]);

  const count = experts.length;
  const isCustom = purpose === 'custom';
  const customTrimmed = customUseCase.trim();
  const canSubmit = !isCustom || customTrimmed.length > 0;

  const handleSubmit = () => {
    const template: string = isCustom ? `custom: ${customTrimmed}` : purpose;
    onConfirm(template, templateId);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Outreach Emails"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outlined" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {count === 1 ? 'Generate 1 Email' : `Generate ${count} Emails`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <RadioGroup
          label="Email Purpose"
          options={RADIO_OPTIONS}
          value={purpose}
          onChange={(v) => setPurpose(v as EmailTemplateKind)}
          helperText="Select the purpose of your email to generate a personalized template"
        />

        {isCustom && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Custom use case <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Describe the purpose or use case for your email. This will be sent to the AI as the
              template context.
            </p>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder={CUSTOM_PLACEHOLDER}
              value={customUseCase}
              onChange={(e) => setCustomUseCase(e.target.value)}
              required={isCustom}
              aria-required={isCustom}
            />
          </div>
        )}

        <Dropdown
          label="Context Template"
          helperText="Select a saved template to provide your contact details and outreach context to the AI."
          trigger={
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500',
                templateId == null && 'text-gray-500'
              )}
            >
              {templateId == null
                ? 'No context template'
                : (templates.find((t) => t.id === templateId)?.name ?? 'No context template')}
              <ChevronDown
                className={cn(
                  'ml-2 h-4 w-4 shrink-0 transition-transform text-gray-400',
                  templateDropdownOpen && 'rotate-180'
                )}
              />
            </button>
          }
          onOpenChange={setTemplateDropdownOpen}
          className="max-h-60 overflow-y-auto"
        >
          <DropdownItem
            onClick={() => setTemplateId(null)}
            className={templateId == null ? 'bg-gray-100 font-medium' : ''}
          >
            No context template
          </DropdownItem>
          {templates.map((t) => (
            <DropdownItem
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={templateId === t.id ? 'bg-gray-100 font-medium' : ''}
            >
              {t.name}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
    </BaseModal>
  );
}
