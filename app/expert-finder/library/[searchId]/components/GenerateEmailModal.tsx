'use client';

import { useState, useEffect, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { useSavedTemplates } from '@/hooks/useExpertFinder';
import { cn } from '@/utils/styles';
import type { ExpertResult } from '@/types/expertFinder';
import type { EmailTemplateKind } from '@/services/expertFinder.service';

export type GenerateEmailConfirmPayload =
  | { mode: 'ai'; template: string }
  | { mode: 'fixed'; templateId: number };

interface GenerateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experts: ExpertResult[];
  onConfirm: (payload: GenerateEmailConfirmPayload) => void;
}

export interface EmailTemplateOption {
  value: EmailTemplateKind;
  label: string;
  description: string;
}

export const EMAIL_TEMPLATE_OPTIONS: EmailTemplateOption[] = [
  {
    value: 'rfp-outreach',
    label: 'Call for Proposals',
    description: 'Invite them to submit proposals and share with their network',
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
    value: 'custom',
    label: 'Custom Message',
    description: 'Write your own purpose or use case for the email',
  },
];

const CUSTOM_PREFIX = 'custom:';

export function getTemplateDisplayLabel(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return 'Saved template';
  const v = value.trim();
  const opt = EMAIL_TEMPLATE_OPTIONS.find((o) => o.value === v);
  if (opt) return opt.label;
  if (v.toLowerCase().startsWith(CUSTOM_PREFIX)) {
    const rest = v.slice(CUSTOM_PREFIX.length).trim();
    if (!rest) return 'Custom';
    return rest.length > 44 ? `${rest.slice(0, 44)}…` : rest;
  }
  return v.length > 48 ? `${v.slice(0, 48)}…` : v;
}

/** Tooltip description for known purposes; custom / free-text returns trimmed text or empty. */
export function getTemplateDescription(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '';
  const v = value.trim();
  const opt = EMAIL_TEMPLATE_OPTIONS.find((o) => o.value === v);
  if (opt) return opt.description;
  if (v.toLowerCase().startsWith(CUSTOM_PREFIX)) {
    return v.slice(CUSTOM_PREFIX.length).trim();
  }
  return v;
}

const CUSTOM_PLACEHOLDER =
  'e.g. Invitation to join an advisory board for a new research initiative';

export function GenerateEmailModal({
  isOpen,
  onClose,
  experts,
  onConfirm,
}: GenerateEmailModalProps) {
  const aiCheckboxId = useId();
  const [useAiGeneration, setUseAiGeneration] = useState(false);
  const [purpose, setPurpose] = useState<EmailTemplateKind>(
    EMAIL_TEMPLATE_OPTIONS[0]?.value ?? 'collaboration'
  );
  const [customUseCase, setCustomUseCase] = useState('');
  const [savedTemplateId, setSavedTemplateId] = useState<number | null>(null);
  const [purposeDropdownOpen, setPurposeDropdownOpen] = useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [{ templates }] = useSavedTemplates({ limit: 100, immediate: isOpen });

  useEffect(() => {
    if (isOpen) {
      setUseAiGeneration(false);
      setPurpose(EMAIL_TEMPLATE_OPTIONS[0]?.value ?? 'collaboration');
      setCustomUseCase('');
      setSavedTemplateId(null);
    }
  }, [isOpen]);

  const count = experts.length;
  const isCustom = purpose === 'custom';
  const customTrimmed = customUseCase.trim();
  const canSubmitAi = !isCustom || customTrimmed.length > 0;
  const canSubmitFixed = savedTemplateId != null;
  const canSubmit = useAiGeneration ? canSubmitAi : canSubmitFixed;

  const selectedPurpose =
    EMAIL_TEMPLATE_OPTIONS.find((option) => option.value === purpose) ?? EMAIL_TEMPLATE_OPTIONS[0];

  const handleSubmit = () => {
    if (useAiGeneration) {
      const template: string = isCustom ? `${CUSTOM_PREFIX} ${customTrimmed}` : purpose;
      onConfirm({ mode: 'ai', template });
    } else if (savedTemplateId != null) {
      onConfirm({ mode: 'fixed', templateId: savedTemplateId });
    }
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
        {!useAiGeneration ? (
          <Dropdown
            label="Choose email template"
            trigger={
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500',
                  savedTemplateId == null && 'text-gray-500'
                )}
              >
                {savedTemplateId == null
                  ? 'Choose email template…'
                  : (templates.find((t) => t.id === savedTemplateId)?.name ??
                    'Choose email template…')}
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
            {templates.length === 0 ? (
              <DropdownItem onClick={() => {}} className="text-gray-500 cursor-default" disabled>
                No saved templates yet
              </DropdownItem>
            ) : (
              templates.map((t) => (
                <DropdownItem
                  key={t.id}
                  onClick={() => setSavedTemplateId(t.id)}
                  className={savedTemplateId === t.id ? 'bg-gray-100 font-medium' : ''}
                >
                  {t.name}
                </DropdownItem>
              ))
            )}
          </Dropdown>
        ) : (
          <>
            <Dropdown
              label="Email purpose"
              trigger={
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{selectedPurpose.label}</div>
                    <div className="truncate text-xs text-gray-500">
                      {selectedPurpose.description}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'ml-2 h-4 w-4 shrink-0 transition-transform text-gray-400',
                      purposeDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>
              }
              onOpenChange={setPurposeDropdownOpen}
              className="max-h-72 overflow-y-auto"
            >
              {EMAIL_TEMPLATE_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => setPurpose(option.value)}
                  className={cn(
                    'items-start text-left',
                    purpose === option.value && 'bg-gray-100 font-medium'
                  )}
                >
                  <div className="w-full text-left">
                    <div className="text-sm text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>

            {isCustom && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Custom use case <span className="text-red-600">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Describe the purpose for the email. This is sent to the AI as the template prompt.
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
          </>
        )}

        <Checkbox
          id={aiCheckboxId}
          checked={useAiGeneration}
          onCheckedChange={setUseAiGeneration}
          label="Use AI to generate the email"
        />
      </div>
    </BaseModal>
  );
}
