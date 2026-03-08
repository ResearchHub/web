'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, Loader2, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Progress } from '@/components/ui/Progress';
import { ExpertFinderService } from '@/services/expertFinder.service';
import type { ExpertResult } from '@/types/expertFinder';

interface GenerateEmailProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  experts: ExpertResult[];
  searchId: string;
  template: string;
  templateId: number | null;
  onDone?: () => void;
}

type RowStatus = 'pending' | 'loading' | 'done' | 'error';

interface RowState {
  name: string;
  status: RowStatus;
  error?: string;
}

export function GenerateEmailProgressModal({
  isOpen,
  onClose,
  experts,
  searchId,
  template,
  templateId,
  onDone,
}: GenerateEmailProgressModalProps) {
  const [rows, setRows] = useState<RowState[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      started.current = false;
      return;
    }
    if (!experts.length) return;
    setRows(
      experts.map((e) => ({
        name: e.name?.trim() || e.email || 'Unknown',
        status: 'pending' as RowStatus,
      }))
    );
    setCompletedCount(0);
    started.current = false;
  }, [isOpen, experts]);

  useEffect(() => {
    if (!isOpen || !experts.length || started.current) return;
    started.current = true;

    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < experts.length; i++) {
        if (cancelled) break;
        const expert = experts[i];
        setRows((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'loading' };
          return next;
        });

        try {
          await ExpertFinderService.generateEmail(
            {
              expert_name: expert.name?.trim() || 'Expert',
              template,
              expert_title: expert.title || undefined,
              expert_affiliation: expert.affiliation || undefined,
              expert_email: expert.email || undefined,
              expertise: expert.expertise || undefined,
              notes: expert.notes || undefined,
              expert_search_id: Number(searchId) || undefined,
              template_id: templateId ?? undefined,
            },
            { save: true }
          );
          if (cancelled) return;
          setRows((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: 'done' };
            return next;
          });
          setCompletedCount((c) => c + 1);
        } catch (e) {
          if (cancelled) return;
          const message = e instanceof Error ? e.message : 'Failed';
          setRows((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: 'error', error: message };
            return next;
          });
          setCompletedCount((c) => c + 1);
        }
      }
      onDone?.();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isOpen, experts, searchId, template, templateId, onDone]);

  const total = experts.length;
  const isComplete = total > 0 && completedCount === total;
  const successCount = rows.filter((r) => r.status === 'done').length;
  const errorCount = rows.filter((r) => r.status === 'error').length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isComplete ? 'Emails Generated' : 'Generating Emails'}
      size="lg"
      showCloseButton={true}
    >
      {isComplete ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {successCount > 0 && errorCount === 0
              ? `All ${successCount} email${successCount === 1 ? '' : 's'} generated successfully.`
              : successCount > 0 && errorCount > 0
                ? `${successCount} email${successCount === 1 ? '' : 's'} generated. ${errorCount} failed.`
                : `Generation finished. ${errorCount} email${errorCount === 1 ? '' : 's'} failed.`}
          </p>

          <ul className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {rows.map((row, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                {row.status === 'done' && (
                  <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
                )}
                {row.status === 'error' && (
                  <X className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
                )}
                <span className="flex-1 truncate">{row.name}</span>
                {row.error && (
                  <span className="text-xs text-red-600 truncate max-w-[120px]" title={row.error}>
                    {row.error}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex justify-end">
            {successCount > 0 && (
              <Link
                href={`/expert-finder/library/${searchId}?tab=outreach`}
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={onClose}
              >
                Go to Outreach
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Please wait while emails are being generated. Do not close this window.
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Progress</span>
              <span>
                {completedCount}/{total}
              </span>
            </div>
            <Progress value={completedCount} max={total} size="md" />
          </div>

          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {rows.map((row, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                {row.status === 'done' && (
                  <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
                )}
                {row.status === 'loading' && (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary-600" aria-hidden />
                )}
                {row.status === 'error' && (
                  <X className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
                )}
                {row.status === 'pending' && (
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />
                )}
                <span className="flex-1 truncate">{row.name}</span>
                {row.error && (
                  <span className="text-xs text-red-600 truncate max-w-[120px]" title={row.error}>
                    {row.error}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500 mt-4">
            Generating personalized emails... This may take a few minutes.
          </p>
        </>
      )}
    </BaseModal>
  );
}
