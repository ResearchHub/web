'use client';

import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Users } from 'lucide-react';
import type { PublishingFormData, SelectOption } from '@/components/Notebook/PublishingForm/schema';
import { Avatar } from '@/components/ui/Avatar';
import type { MultiSelectOption } from '@/components/ui/form/SearchableMultiSelect';
import { SearchableUserSelect } from '@/components/ui/form/SearchableUserSelect';
import type { UserSuggestion } from '@/types/search';
import { cn } from '@/utils/styles';
import { AddDetail, DetailValue } from './MastheadLine';
import { joinNames, type MastheadWidgetConfig } from './mastheadWidgets';
import { useLeaveToCommit } from './useLeaveToCommit';

/** An RFP's contacts are users; a work's authors are author profiles. */
const getContactId = (user: UserSuggestion) => user.id!.toString();

const renderPerson = (option: MultiSelectOption, { focus }: { focus: boolean }) => (
  <div
    className={cn(
      'flex h-10 cursor-pointer items-center gap-2.5 rounded-[7px] px-2 text-sm text-gray-900',
      focus && 'bg-gray-100'
    )}
  >
    <Avatar src={option.avatarUrl} alt={option.label} size="xs" disableTooltip />
    <span className="min-w-0 flex-1 truncate">{option.label}</span>
  </div>
);

interface PeopleWidgetProps {
  readonly config: MastheadWidgetConfig;
  readonly value: SelectOption[];
  readonly editable: boolean;
  readonly editing: boolean;
  readonly onEditingChange: (editing: boolean) => void;
}

/** The people on the work: a proposal's authors, an RFP's contacts. Any number of them. */
export function PeopleWidget({
  config,
  value,
  editable,
  editing,
  onEditingChange,
}: PeopleWidgetProps) {
  if (editing && editable) {
    return (
      <PeopleEditor
        config={config}
        value={value}
        onClose={() => onEditingChange(false)}
        className="basis-full"
      />
    );
  }
  if (value.length > 0) {
    return (
      <DetailValue label={config.label} onEdit={editable ? () => onEditingChange(true) : undefined}>
        {joinNames(value.map((person) => person.label))}
      </DetailValue>
    );
  }
  if (!editable) return null;
  return (
    <AddDetail icon={config.icon} label={config.addLabel} onClick={() => onEditingChange(true)} />
  );
}

/**
 * The shared people picker, dressed as a field: the people already added
 * stay as chips and the search adds another. Each change is the form's at
 * once; Escape puts back who was there when the field opened.
 */
export function PeopleEditor({
  config,
  value,
  onClose,
  className,
}: {
  readonly config: MastheadWidgetConfig;
  readonly value: SelectOption[];
  readonly onClose: () => void;
  readonly className?: string;
}) {
  const { setValue } = useFormContext<PublishingFormData>();
  const field = config.field === 'contacts' ? 'contacts' : 'authors';
  const write = (people: SelectOption[]) => setValue(field, people, { shouldValidate: true });
  const openedWithRef = useRef(value);
  const ref = useRef<HTMLDivElement>(null);
  useLeaveToCommit(ref, onClose);

  return (
    <div
      ref={ref}
      className={className}
      onKeyDownCapture={(event) => {
        // Only once the search is empty: with text in it Enter picks a result
        // and Escape clears it, both the picker's own.
        const input = event.target;
        if (!(input instanceof HTMLInputElement) || input.value !== '') return;
        if (event.key === 'Enter') {
          event.preventDefault();
          onClose();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          write(openedWithRef.current);
          onClose();
        }
      }}
    >
      <SearchableUserSelect
        value={value}
        onChange={write}
        sortable={field === 'authors'}
        getOptionValue={field === 'contacts' ? getContactId : undefined}
        autoFocus
        placeholder="Search by name…"
        placeholderWhenFilled="Add another…"
        leading={<Users className="h-4 w-4 shrink-0 text-gray-600" aria-hidden="true" />}
        renderOption={renderPerson}
        className="min-h-10 items-center gap-2 rounded-lg border-primary-600 py-0.5 pl-2.5 pr-2 ring-[3px] ring-primary-600/15 focus-within:border-primary-600 focus-within:ring-[3px] focus-within:ring-primary-600/15"
        optionsClassName="mt-1.5 rounded-[10px] border border-gray-200 p-1.5 shadow-xl ring-0"
      />
    </div>
  );
}
