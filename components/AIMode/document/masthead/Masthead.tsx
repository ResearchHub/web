'use client';

import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { cn } from '@/utils/styles';
import { AmountWidget } from './AmountWidget';
import { ApplyingToWidget } from './ApplyingToWidget';
import { CoverBanner, useCoverImagePicker } from './CoverImage';
import { AddDetail } from './MastheadLine';
import { MastheadTitle } from './MastheadTitle';
import {
  detailValue,
  mastheadWidgetsFor,
  peopleOf,
  type MastheadWidgetConfig,
} from './mastheadWidgets';
import { PeopleWidget } from './PeopleWidget';
import { TextWidget } from './TextWidget';

const LINE_CLASS = 'flex flex-wrap items-center gap-x-5 text-sm text-gray-600';

interface MastheadProps {
  /** The note's title, which the work is published under. */
  readonly title: string;
  readonly onRename: (title: string) => void;
  /**
   * What is set shows as it will be published, and nothing can be added or
   * changed. The phone's drawer, whose Details form holds every field; a
   * field must never have two inputs mounted at once.
   */
  readonly readOnly?: boolean;
}

/**
 * The publishing details as the head of the document, shaped like the header
 * the published page will have and no heavier: the cover image once there is
 * one, the title, the authors and the RFP each on a line of their own once
 * set, and one quiet line of the rest. A detail with a value is a label and
 * the value ("By Kobe Attias"), one without is its icon and what to do ("Add
 * cover"), and the one being edited is a small field in its place. Nothing here is ever marked as
 * missing: the publish dialog lists what is still empty.
 */
export function Masthead({ title, onRename, readOnly = false }: MastheadProps) {
  const { note, articleType, readOnly: formReadOnly, isDeclined } = usePublishingController();
  const values = useWatch<PublishingFormData>() as PublishingFormData;
  const canEdit = !readOnly && !formReadOnly && !isDeclined;

  // One editor at a time.
  const [editingId, setEditingId] = useState<string | null>(null);
  const noteId = note?.id ?? null;
  useEffect(() => {
    setEditingId(null);
  }, [noteId]);

  const widgets = mastheadWidgetsFor(articleType).filter((widget) => !widget.hiddenWhen?.(values));
  const isEditable = (config: MastheadWidgetConfig) => canEdit && !config.lockedWhen?.(values);

  const coverConfig = widgets.find((widget) => widget.kind === 'cover');
  const cover = useCoverImagePicker(values.coverImage);
  const coverEditable = coverConfig != null && isEditable(coverConfig);

  // A paragraph is an offer on the line until it is written; from then on it
  // stands under the line as the paragraph it is.
  const standsAlone = (config: MastheadWidgetConfig) =>
    config.kind === 'paragraph' &&
    (editingId === config.id || Boolean(values.shortDescription?.trim()));

  // The details with a line to themselves: the authors and the RFP, once
  // they are set. Until then their offers sit with the other details. A
  // people picker that is open keeps its line until it closes, rather than
  // jumping into the row the moment the last name is removed.
  const onOwnLine = (config: MastheadWidgetConfig) =>
    (config.ownLineWhen?.(values) ?? false) ||
    (config.kind === 'people' && editingId === config.id);
  const ownLine = widgets.filter(onOwnLine);

  const hasValue = (config: MastheadWidgetConfig) =>
    config.kind === 'cover' ? cover.imageUrl != null : detailValue(config, values) != null;
  // The shared line, and whether anything on it will show: a detail shows
  // its value, or an offer to add one when it can be edited.
  const rowWidgets = widgets.filter(
    (widget) => widget.kind !== 'cover' && !standsAlone(widget) && !onOwnLine(widget)
  );
  const offersCover = coverConfig != null && coverEditable && !cover.imageUrl;
  const rowShows =
    offersCover || rowWidgets.some((widget) => isEditable(widget) || hasValue(widget));

  const renderDetail = (config: MastheadWidgetConfig) => {
    const state = {
      config,
      editable: isEditable(config),
      editing: editingId === config.id,
      onEditingChange: (editing: boolean) =>
        setEditingId((current) => {
          if (editing) return config.id;
          return current === config.id ? null : current;
        }),
    };
    switch (config.kind) {
      case 'cover':
        return null;
      case 'people':
        return <PeopleWidget key={config.id} {...state} value={peopleOf(values, config.field)} />;
      case 'amount':
        return <AmountWidget key={config.id} {...state} value={values.budget} />;
      case 'grant':
        return noteId == null ? null : (
          <ApplyingToWidget
            key={config.id}
            config={config}
            noteId={noteId}
            editable={state.editable}
            editing={state.editing}
            onEditingChange={state.onEditingChange}
          />
        );
      case 'text':
        return <TextWidget key={config.id} {...state} value={values.organization} />;
      case 'paragraph':
        return <TextWidget key={config.id} {...state} value={values.shortDescription} />;
    }
  };

  return (
    // Indented by the gutter the editor keeps for its block handles (see
    // `.ai-mode-document .ProseMirror`), so the title and the text under it
    // share a left edge.
    <header className="mb-6 ml-16 flex flex-col gap-3 border-b border-gray-200 pb-5">
      {coverConfig && cover.imageUrl && (
        <CoverBanner
          imageUrl={cover.imageUrl}
          onChange={coverEditable ? cover.browse : undefined}
          onRemove={coverEditable ? cover.remove : undefined}
        />
      )}
      <MastheadTitle title={title} onRename={canEdit ? onRename : undefined} />

      {/* The byline: its lines sit closer to each other than to the title. */}
      {(ownLine.length > 0 || rowShows) && (
        <div className="flex flex-col gap-1.5">
          {ownLine.map((config) => (
            <div key={config.id} className={LINE_CLASS}>
              {renderDetail(config)}
            </div>
          ))}
          {rowShows && (
            <div className={cn(LINE_CLASS, 'gap-y-1.5')}>
              {rowWidgets.map(renderDetail)}
              {offersCover && (
                <AddDetail
                  icon={coverConfig.icon}
                  label={coverConfig.addLabel}
                  onClick={cover.browse}
                />
              )}
            </div>
          )}
        </div>
      )}
      {widgets.filter(standsAlone).map(renderDetail)}

      {cover.error && (
        <p role="status" className="text-xs text-gray-600">
          {cover.error}
        </p>
      )}
      {coverEditable && <input {...cover.inputProps} />}
    </header>
  );
}
