import {
  Accessibility,
  type defaultPreset,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/dom';
import { arrayMove } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { GripVertical, X } from 'lucide-react';
import { Fragment, useEffect, useId, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import type { MultiSelectOption } from './SearchableMultiSelect';

interface SortableMultiSelectOptionsProps {
  options: MultiSelectOption[];
  focusedOptionIndex: number | null;
  disabled?: boolean;
  onRemove: (option: MultiSelectOption) => void;
  onReorder: (options: MultiSelectOption[]) => void;
}

interface MultiSelectOptionPillProps {
  option: MultiSelectOption;
  index: number;
  optionCount: number;
  isFocused: boolean;
  disabled?: boolean;
  isGripDecorative?: boolean;
  handleId?: string;
  setPillRef?: (element: Element | null) => void;
  setHandleRef?: (element: Element | null) => void;
  isDragging?: boolean;
  isDropping?: boolean;
  onRemove: (option: MultiSelectOption) => void;
}

type SortableOptionPillProps = Omit<
  MultiSelectOptionPillProps,
  'isGripDecorative' | 'handleId' | 'setPillRef' | 'setHandleRef' | 'isDragging' | 'isDropping'
> & { handleId: string; optionOrderKey: string };

interface ReorderDetails {
  fromIndex: number;
  toIndex: number;
  optionLabel: string;
}

type SortableOptionData = {
  value: string;
  label: string;
  optionCount: number;
  optionOrderKey: string;
  renderedIndex: number;
};

interface DropFeedback {
  resetGeneration: number;
  announcementGeneration: number;
  announcement?: string;
  focusHandleId?: string;
}

function getSortableOptionData(source: {
  data: Record<PropertyKey, unknown>;
}): SortableOptionData | undefined {
  const { value, label, optionCount, optionOrderKey, renderedIndex } = source.data;
  if (
    typeof value !== 'string' ||
    typeof label !== 'string' ||
    typeof optionCount !== 'number' ||
    typeof optionOrderKey !== 'string' ||
    typeof renderedIndex !== 'number'
  ) {
    return;
  }

  return { value, label, optionCount, optionOrderKey, renderedIndex };
}

function getOptionOrderKey(options: MultiSelectOption[]) {
  return JSON.stringify(options.map((option) => option.value));
}

function getDragHandleId(prefix: string, optionValue: string) {
  return `${prefix}-handle-${encodeURIComponent(optionValue)}`;
}

function canReorderOption(
  source: {
    id: unknown;
    initialIndex: number;
    index: number;
    disabled: boolean;
    handle?: Element;
  },
  target: { disabled: boolean },
  optionData: SortableOptionData
) {
  return (
    source.id === optionData.value &&
    source.initialIndex === optionData.renderedIndex &&
    source.initialIndex >= 0 &&
    source.index >= 0 &&
    source.initialIndex < optionData.optionCount &&
    source.index < optionData.optionCount &&
    !source.disabled &&
    !target.disabled &&
    source.handle?.matches(':disabled') === false
  );
}

function getReorderDetails(
  event: DragEndEvent,
  options: MultiSelectOption[],
  optionOrderKey: string,
  disabled?: boolean
): ReorderDetails | undefined {
  const { source, target } = event.operation;
  if (event.canceled || disabled || !isSortable(source) || !isSortable(target)) return;

  const { initialIndex: fromIndex, index: toIndex } = source;
  const optionData = getSortableOptionData(source);
  if (
    !optionData ||
    optionData.optionOrderKey !== optionOrderKey ||
    !canReorderOption(source, target, optionData)
  ) {
    return;
  }

  const sourceOption = options[fromIndex];
  if (sourceOption?.value !== source.id) return;

  return {
    fromIndex,
    toIndex,
    optionLabel: sourceOption.label,
  };
}

const sortableAccessibility = Accessibility.configure({
  screenReaderInstructions: {
    draggable:
      'To reorder an author, press Space or Enter. While dragging, use the arrow keys to move the author. Press Space or Enter again to drop, or Escape to cancel.',
  },
  announcements: {
    dragstart({ operation: { source } }: DragStartEvent) {
      if (!isSortable(source)) return;

      const optionData = getSortableOptionData(source);
      if (!optionData) return;

      return `Picked up ${optionData.label}, position ${source.initialIndex + 1} of ${optionData.optionCount}.`;
    },
    dragover({ operation: { source, target } }: DragOverEvent) {
      if (!isSortable(source)) return;

      const optionData = getSortableOptionData(source);
      if (!optionData) return;
      if (!isSortable(target)) {
        return `${optionData.label} is not over a valid position.`;
      }
      if (!canReorderOption(source, target, optionData)) {
        return `${optionData.label} is not over a valid position.`;
      }

      return `${optionData.label} is at position ${source.index + 1} of ${optionData.optionCount}.`;
    },
    dragend(event: DragEndEvent) {
      const { source } = event.operation;
      if (!isSortable(source)) return;

      const optionData = getSortableOptionData(source);
      if (!optionData) return;

      if (event.canceled) {
        return `Sorting canceled for ${optionData.label}. No reorder was applied.`;
      }
    },
  },
});

function addSortableAccessibility(defaultPlugins: typeof defaultPreset.plugins) {
  return [...defaultPlugins, sortableAccessibility];
}

function stopComboboxPropagation(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function preventComboboxActivation(event: React.SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function MultiSelectOptionPill({
  option,
  index,
  optionCount,
  isFocused,
  disabled,
  isGripDecorative,
  handleId,
  setPillRef,
  setHandleRef,
  isDragging,
  isDropping,
  onRemove,
}: MultiSelectOptionPillProps) {
  const gripIcon = <GripVertical className="h-4 w-4" aria-hidden="true" />;
  const removeOption = (event: React.MouseEvent<HTMLButtonElement>) => {
    preventComboboxActivation(event);
    if (disabled) return;
    onRemove(option);
  };

  return (
    <span
      ref={setPillRef}
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 py-0.5 pl-0.5 pr-2 text-sm',
        isFocused && 'bg-gray-200 ring-2 ring-gray-400',
        (isDragging || isDropping) &&
          'relative z-10 bg-white opacity-90 shadow-lg ring-2 ring-primary-400'
      )}
    >
      {isGripDecorative ? (
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-gray-300"
        >
          {gripIcon}
        </span>
      ) : (
        <button
          id={handleId}
          ref={setHandleRef}
          type="button"
          disabled={disabled}
          aria-label={`Reorder ${option.label}, position ${index + 1} of ${optionCount}`}
          className="inline-flex h-8 w-8 shrink-0 touch-none cursor-grab items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:text-gray-300"
          onPointerDown={stopComboboxPropagation}
          onKeyDown={stopComboboxPropagation}
          onClick={preventComboboxActivation}
        >
          {gripIcon}
        </button>
      )}
      <span className="shrink-0" aria-hidden="true">
        <Avatar src={option.avatarUrl} alt={option.label} size="xxs" disableTooltip />
      </span>
      <span className="min-w-0 truncate">{option.label}</span>
      <button
        type="button"
        disabled={disabled}
        aria-label={`Remove ${option.label}`}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:text-gray-300"
        onPointerDown={stopComboboxPropagation}
        onKeyDown={stopComboboxPropagation}
        onClick={removeOption}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

function SortableOptionPill({ optionOrderKey, ...props }: SortableOptionPillProps) {
  const { option, index, disabled } = props;
  const {
    ref: setPillRef,
    handleRef: setHandleRef,
    isDragging,
    isDropping,
  } = useSortable<SortableOptionData>({
    id: option.value,
    index,
    disabled,
    data: {
      value: option.value,
      label: option.label,
      optionCount: props.optionCount,
      optionOrderKey,
      renderedIndex: index,
    },
  });

  return (
    <MultiSelectOptionPill
      {...props}
      setPillRef={setPillRef}
      setHandleRef={setHandleRef}
      isDragging={isDragging}
      isDropping={isDropping}
    />
  );
}

function SortableOptionList({
  options,
  focusedOptionIndex,
  disabled,
  onRemove,
  onReorder,
}: SortableMultiSelectOptionsProps) {
  const handleIdPrefix = useId();
  const optionOrderKey = getOptionOrderKey(options);
  const [dropFeedback, setDropFeedback] = useState<DropFeedback>({
    resetGeneration: 0,
    announcementGeneration: 0,
  });
  const {
    resetGeneration,
    announcementGeneration,
    announcement,
    focusHandleId: pendingFocusHandleId,
  } = dropFeedback;

  useEffect(() => {
    if (!pendingFocusHandleId) return;

    document.getElementById(pendingFocusHandleId)?.focus();
  }, [pendingFocusHandleId, resetGeneration]);

  const rejectDrop = (event: DragEndEvent) => {
    const { source } = event.operation;
    if (event.canceled) return;

    const sortableSource = isSortable(source) ? source : undefined;
    const shouldReset =
      sortableSource !== undefined && sortableSource.initialIndex !== sortableSource.index;
    const suspendedDrop = shouldReset ? event.suspend() : undefined;
    const sourceOption =
      typeof sortableSource?.id === 'string'
        ? options.find((option) => option.value === sortableSource.id)
        : undefined;
    const focusHandleId =
      shouldReset &&
      sourceOption &&
      sortableSource &&
      event.operation.activatorEvent?.type === 'keydown' &&
      !disabled &&
      !sortableSource.disabled &&
      sortableSource.handle?.matches(':disabled') === false
        ? getDragHandleId(handleIdPrefix, sourceOption.value)
        : undefined;
    const optionData = sortableSource ? getSortableOptionData(sortableSource) : undefined;
    const sourceLabel = sourceOption?.label ?? optionData?.label;

    setDropFeedback((currentFeedback) => ({
      resetGeneration: currentFeedback.resetGeneration + (shouldReset ? 1 : 0),
      announcementGeneration: currentFeedback.announcementGeneration + 1,
      announcement: sourceLabel
        ? `Sorting stopped. No reorder was applied for ${sourceLabel}.`
        : 'Sorting stopped. No reorder was applied.',
      focusHandleId,
    }));
    suspendedDrop?.abort();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const reorderDetails = getReorderDetails(event, options, optionOrderKey, disabled);
    if (!reorderDetails) {
      rejectDrop(event);
      return;
    }

    const { fromIndex, toIndex, optionLabel } = reorderDetails;
    setDropFeedback((currentFeedback) => ({
      ...currentFeedback,
      announcementGeneration: currentFeedback.announcementGeneration + 1,
      announcement:
        fromIndex === toIndex
          ? `No change. ${optionLabel} remains at position ${fromIndex + 1} of ${options.length}.`
          : `${optionLabel} dropped at position ${toIndex + 1} of ${options.length}.`,
      focusHandleId: undefined,
    }));

    if (fromIndex !== toIndex) {
      onReorder(arrayMove(options, fromIndex, toIndex));
    }
  };

  return (
    <>
      <DragDropProvider plugins={addSortableAccessibility} onDragEnd={handleDragEnd}>
        <Fragment key={resetGeneration}>
          {options.map((option, index) => (
            <SortableOptionPill
              key={option.value}
              option={option}
              index={index}
              optionCount={options.length}
              isFocused={focusedOptionIndex === index}
              disabled={disabled}
              handleId={getDragHandleId(handleIdPrefix, option.value)}
              optionOrderKey={optionOrderKey}
              onRemove={onRemove}
            />
          ))}
        </Fragment>
      </DragDropProvider>
      {[0, 1].map((announcementSlot) => (
        <span
          key={announcementSlot}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcementGeneration % 2 === announcementSlot ? announcement : undefined}
        </span>
      ))}
    </>
  );
}

export function SortableMultiSelectOptions(props: SortableMultiSelectOptionsProps) {
  const { options, focusedOptionIndex, disabled, onRemove } = props;
  if (options.length > 1) return <SortableOptionList {...props} />;

  return options.map((option, index) => (
    <MultiSelectOptionPill
      key={option.value}
      option={option}
      index={index}
      optionCount={options.length}
      isFocused={focusedOptionIndex === index}
      disabled={disabled}
      isGripDecorative
      onRemove={onRemove}
    />
  ));
}
