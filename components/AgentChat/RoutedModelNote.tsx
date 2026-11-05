'use client';

import { Shuffle } from 'lucide-react';
import { useResearchAI } from '@/hooks/useResearchAI';
import { findModel, unknownModel } from '@/types/agentModels';

interface RoutedModelNoteProps {
  /** The model the turn was submitted with; empty on legacy turns. */
  readonly model: string;
  /** The model that answered instead, after `model` refused. */
  readonly routedModel: string;
}

/**
 * Above an answer the chat's own model did not write: it refused the
 * conversation, and the server's fallback model answered this turn and every
 * one after it. Labels come from the catalog the chat surface already holds,
 * so this reads the shared store without fetching.
 */
export function RoutedModelNote({ model, routedModel }: RoutedModelNoteProps) {
  const { catalog } = useResearchAI();
  const labelOf = (ref: string) =>
    (findModel(catalog?.models ?? [], ref) ?? unknownModel(ref)).label;
  const declined = model ? labelOf(model) : 'This chat’s model';

  return (
    <p className="flex items-start gap-2 px-0.5 text-sm leading-relaxed text-gray-500">
      <Shuffle className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Answered by <span className="font-medium text-gray-700">{labelOf(routedModel)}</span>{' '}
        because {declined} declined this conversation.
      </span>
    </p>
  );
}
