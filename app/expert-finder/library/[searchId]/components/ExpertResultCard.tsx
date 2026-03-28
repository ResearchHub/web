'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { Award, Building2, ExternalLink, GraduationCap, Info, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import type { ExpertResult } from '@/types/expertFinder';

interface ExpertResultCardProps {
  expert: ExpertResult;
  index: number;
  selected?: boolean;
  onToggleSelect?: (index: number) => void;
  onGenerateEmail?: (expert: ExpertResult) => void;
}

function empty(value: string | undefined): string {
  return value?.trim() || '';
}

export function ExpertResultCard({
  expert,
  index,
  selected,
  onToggleSelect,
  onGenerateEmail,
}: ExpertResultCardProps) {
  const name = empty(expert.name);
  const title = empty(expert.title);
  const affiliation = empty(expert.affiliation);
  const expertiseStr = empty(expert.expertise);
  const expertiseTags = expertiseStr
    ? expertiseStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const notes = empty(expert.notes);
  const email = expert.email?.trim();
  const sources = expert.sources?.length ? expert.sources : [];

  const [notesExpanded, setNotesExpanded] = useState(false);
  const notesMeasureRef = useRef<HTMLParagraphElement>(null);
  const [notesOverflows, setNotesOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = notesMeasureRef.current;
    if (!el || !notes) {
      setNotesOverflows(false);
      return;
    }
    if (notesExpanded) return;
    setNotesOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [notes, notesExpanded]);

  const showNotesToggle = notesOverflows || notesExpanded;

  return (
    <article
      className={cn(
        'flex h-full min-h-0 flex-col rounded-lg border bg-white p-5 shadow-sm',
        selected ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <header className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-base font-semibold text-gray-900 shrink-0">{name || '—'}</h3>
            {sources.length > 0
              ? sources.map((src, i) => (
                  <a
                    key={`${src.url}-${i}`}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-0 max-w-full items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    <span className="truncate">{src.text}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  </a>
                ))
              : null}
          </div>
          {title ? (
            <p
              className="mt-0.5 line-clamp-2 min-w-0 break-words text-sm text-gray-500"
              title={title}
            >
              {title}
            </p>
          ) : null}
        </header>
        {onToggleSelect && (
          <div className="flex shrink-0 items-center justify-end pt-0.5">
            <Checkbox
              checked={selected ?? false}
              onCheckedChange={() => onToggleSelect(index)}
              aria-label={`Select ${name || 'expert'}`}
            />
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {affiliation ? (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" aria-hidden />
            <span>{affiliation}</span>
          </div>
        ) : null}

        {expertiseTags.length > 0 ? (
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-700">
            <GraduationCap className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <span>Expertise</span>
            <Tooltip
              content={
                <ul className="max-h-64 list-disc space-y-1 overflow-y-auto pl-4 text-left text-sm leading-snug">
                  {expertiseTags.map((tag, i) => (
                    <li key={`${tag}-${i}`}>{tag}</li>
                  ))}
                </ul>
              }
              position="top"
              width="w-72"
              className="text-left"
              wrapperClassName="inline-flex shrink-0 items-center"
            >
              <button
                type="button"
                className="inline-flex rounded p-0.5 text-gray-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
                aria-label={`All expertise areas (${expertiseTags.length})`}
                title={expertiseTags.join(' · ')}
              >
                <Info className="h-4 w-4 shrink-0" aria-hidden />
              </button>
            </Tooltip>
          </div>
        ) : null}

        {notes ? (
          <div className="rounded-lg bg-gray-100 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Award className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              <span>Why Recommended:</span>
            </div>
            <div className="mt-1 text-sm leading-relaxed text-gray-600">
              <span
                ref={notesMeasureRef}
                className={cn(
                  'inline-block w-full max-w-full align-baseline',
                  !notesExpanded && 'line-clamp-2'
                )}
              >
                {notes}
              </span>
              {showNotesToggle ? (
                <>
                  {' '}
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline align-baseline font-medium text-primary-600 underline-offset-2 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded"
                    onClick={() => setNotesExpanded((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setNotesExpanded((v) => !v);
                      }
                    }}
                    aria-expanded={notesExpanded}
                  >
                    {notesExpanded ? 'Read less' : 'Read more'}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-4 shrink-0 flex flex-col gap-2">
        {onGenerateEmail && (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={() => onGenerateEmail(expert)}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            Generate email
          </Button>
        )}
        {email && !onGenerateEmail && (
          <a
            href={`mailto:${email}`}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700',
              'w-full'
            )}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            Contact Expert
          </a>
        )}
      </div>
    </article>
  );
}
