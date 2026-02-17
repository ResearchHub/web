'use client';

import Link from 'next/link';
import { Award, Building2, GraduationCap, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import type { ExpertResult } from '@/types/expertFinder';

interface ExpertResultCardProps {
  expert: ExpertResult;
}

function empty(value: string | undefined): string {
  return value?.trim() || '';
}

export function ExpertResultCard({ expert }: ExpertResultCardProps) {
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
    <article className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
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
            <div className="flex flex-wrap gap-1.5">
              {expertiseTags.map((tag, i) => (
                <Badge key={i} variant="primary">
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

      {email ? (
        <div className="mt-auto pt-4 border-t border-gray-100 shrink-0">
          <Link
            href={`mailto:${email}`}
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'w-full gap-2 inline-flex'
            )}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            <span>Contact Expert</span>
          </Link>
        </div>
      ) : null}
    </article>
  );
}
