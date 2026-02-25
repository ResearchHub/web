'use client';

import { Award, Building2, GraduationCap, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
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

  return (
    <article
      className={cn(
        'flex h-full min-h-0 flex-col rounded-lg border bg-white p-5 shadow-sm',
        selected ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200'
      )}
    >
      {onToggleSelect && (
        <div className="flex items-center justify-end mb-2">
          <Checkbox
            checked={selected ?? false}
            onCheckedChange={() => onToggleSelect(index)}
            aria-label={`Select ${name || 'expert'}`}
          />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <header>
          <h3 className="text-base font-semibold text-gray-900">{name || '—'}</h3>
          {title ? <p className="text-sm text-gray-500 mt-0.5">{title}</p> : null}
        </header>

        {affiliation ? (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" aria-hidden />
            <span>{affiliation}</span>
          </div>
        ) : null}

        {expertiseTags.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <GraduationCap className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              <span>Expertise:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {expertiseTags.map((tag) => (
                <Badge key={tag} variant="primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {notes ? (
          <div className="rounded-lg bg-gray-100 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Award className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              <span>Why Recommended:</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{notes}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 shrink-0 flex flex-col gap-2">
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
