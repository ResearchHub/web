'use client';

import { motion } from 'framer-motion';
import { Building2, FileText, Scale, X, type LucideIcon } from 'lucide-react';
import {
  JudgmentDocument,
  OrgProfileCard,
  RfpDocument,
  type DocumentTab,
  type JudgmentSectionId,
  type OrgSectionId,
} from '@/components/Funding/documents';
import { cn } from '@/utils/styles';
import { useAIMode } from '../lib/AIModeContext';
import { RFP_SECTIONS } from '../lib/grantData';
import { getOrgProfile } from '../lib/grants';
import type { GrantRecord } from '../lib/types';

interface TabSpec {
  id: DocumentTab;
  label: string;
  icon: LucideIcon;
  badge: (grant: GrantRecord) => { label: string; tone: 'neutral' | 'live' | 'active' } | null;
}

const TABS: TabSpec[] = [
  {
    id: 'rfp',
    label: 'RFP',
    icon: FileText,
    badge: (grant) => {
      if (grant.rfp.status === 'published') return { label: 'Live', tone: 'live' };
      const drafted = grant.rfp.revealedSections.length;
      if (drafted === 0) return null;
      if (drafted < RFP_SECTIONS.length) {
        return { label: `${drafted}/${RFP_SECTIONS.length}`, tone: 'neutral' };
      }
      return null;
    },
  },
  {
    id: 'judgment',
    label: 'Judgment',
    icon: Scale,
    badge: () => null,
  },
  { id: 'org', label: 'About', icon: Building2, badge: () => null },
];

const BADGE_TONE = {
  neutral: 'bg-gray-100 text-gray-500',
  live: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700',
} as const;

interface DocumentPanelProps {
  readonly grant: GrantRecord;
  readonly tab: DocumentTab;
  readonly onTabChange: (tab: DocumentTab) => void;
  readonly onClose: () => void;
}

/**
 * The third column: the documents behind the program, one at a time. The
 * widgets themselves are pure (`components/Funding/documents`); this panel is
 * what binds them to the conversation's grant and to citation highlights.
 */
export const DocumentPanel = ({ grant, tab, onTabChange, onClose }: DocumentPanelProps) => {
  const { highlight, actions } = useAIMode();
  const org = getOrgProfile(grant.orgId);
  const activeHighlight = highlight?.tab === tab ? highlight : null;

  return (
    <div className="flex h-full w-full flex-col border-l border-gray-200 bg-gray-50/60">
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1" role="tablist">
          {TABS.map((spec) => {
            const isActive = spec.id === tab;
            const badge = spec.badge(grant);
            const Icon = spec.icon;

            return (
              <button
                key={spec.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(spec.id)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="ai-mode-document-tab"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className={cn('relative h-3.5 w-3.5', isActive ? 'text-primary-600' : '')} />
                <span className="relative">{spec.label}</span>
                {badge && (
                  <span
                    className={cn(
                      'relative rounded px-1 py-px text-[10px] font-semibold',
                      BADGE_TONE[badge.tone]
                    )}
                  >
                    {badge.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close documents"
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-200/70 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {/* Keyed on the tab so a switch re-mounts and fades the card in. No
            exit animation: the next document should never wait on the last. */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="mx-auto max-w-[640px] rounded-xl border border-gray-200 bg-white px-9 py-10 shadow-sm"
        >
          {tab === 'rfp' && (
            <RfpDocument
              title={grant.title}
              organization={org.name}
              amountUsd={grant.amountUsd}
              sections={RFP_SECTIONS}
              revealedSectionIds={grant.rfp.revealedSections}
              status={grant.rfp.status === 'published' ? 'published' : undefined}
              highlightSectionId={activeHighlight?.sectionId ?? null}
              highlightKey={activeHighlight?.key ?? null}
            />
          )}
          {tab === 'judgment' && (
            <JudgmentDocument
              policy={grant.judgment.policy}
              orgName={org.name}
              confirmed={grant.judgment.confirmed}
              onChange={actions.updateJudgment}
              onConfirm={actions.confirmJudgment}
              highlightSectionId={(activeHighlight?.sectionId as JudgmentSectionId | null) ?? null}
              highlightKey={activeHighlight?.key ?? null}
            />
          )}
          {tab === 'org' && (
            <OrgProfileCard
              profile={org}
              highlightSectionId={(activeHighlight?.sectionId as OrgSectionId | null) ?? null}
              highlightKey={activeHighlight?.key ?? null}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};
