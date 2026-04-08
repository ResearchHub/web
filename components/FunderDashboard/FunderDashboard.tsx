'use client';

import { FC, useMemo, useState } from 'react';
import {
  MOCK_FUNDER,
  MOCK_GRANT,
  MOCK_GRANT_2,
  MOCK_FUNDED_RESEARCHERS,
  GrantSummary,
} from './mockData';
import { GrantNewsSection } from './GrantNewsSection';
import { GrantDetailView } from './GrantDetailView';
import { cn } from '@/utils/styles';
import { ChevronDown } from 'lucide-react';

// ─── Grant Selector ───────────────────────────────────────────────

const GrantSelector: FC<{
  grants: GrantSummary[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
}> = ({ grants, selectedId, onChange }) => {
  const [open, setOpen] = useState(false);

  const selected = selectedId ? grants.find((g) => g.id === selectedId) : null;
  const label = selected ? selected.shortTitle : 'All Funding';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-[13px] font-semibold text-gray-700 shadow-sm cursor-pointer"
      >
        <span className="truncate max-w-[240px]">{label}</span>
        <ChevronDown
          size={14}
          className={cn('text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[280px]">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors cursor-pointer',
                !selectedId ? 'font-bold text-primary-600 bg-primary-50' : 'text-gray-700'
              )}
            >
              All Funding
            </button>
            {grants.map((grant) => (
              <button
                key={grant.id}
                type="button"
                onClick={() => {
                  onChange(grant.id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors cursor-pointer',
                  selectedId === grant.id
                    ? 'font-bold text-primary-600 bg-primary-50'
                    : 'text-gray-700'
                )}
              >
                <span className="block truncate">{grant.shortTitle}</span>
                <span className="text-[11px] text-gray-400">{grant.organization}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Cumulative Stats ─────────────────────────────────────────────

const CumulativeStats: FC<{ grants: GrantSummary[] }> = ({ grants }) => {
  const fmt = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  const totals = useMemo(() => {
    return grants.reduce(
      (acc, g) => ({
        budget: acc.budget + g.budgetAmount.usd,
        distributed: acc.distributed + g.distributedAmount.usd,
        matched: acc.matched + g.matchedAmount.usd,
        applicants: acc.applicants + g.proposals.length,
      }),
      { budget: 0, distributed: 0, matched: 0, applicants: 0 }
    );
  }, [grants]);

  const stats = [
    { label: 'Available', value: fmt(totals.budget), subtitle: 'Total funding budget' },
    { label: 'Distributed', value: fmt(totals.distributed), subtitle: 'Funded by you' },
    { label: 'Matched', value: fmt(totals.matched), subtitle: 'Community contributions' },
    { label: 'Applicants', value: String(totals.applicants), subtitle: 'Active proposals' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {stat.label}
          </div>
          <div className="text-xl font-extrabold font-mono tracking-tight mt-0.5 text-gray-900">
            {stat.value}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Funded Researchers ───────────────────────────────────────────

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
  'from-lime-500 to-green-600',
];

const FundedResearchersSection: FC = () => {
  const researchers = MOCK_FUNDED_RESEARCHERS;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-5 py-4">
      <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">
        Funded Researchers
      </h3>
      <div className="flex flex-wrap gap-3">
        {researchers.map((r, i) => (
          <div
            key={r.id}
            className="group flex flex-col items-center gap-1.5 cursor-pointer"
            title={`${r.fullName} — ${r.institution}`}
          >
            {r.avatarUrl ? (
              <img
                src={r.avatarUrl}
                alt={r.fullName}
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white group-hover:ring-primary-200 transition-all group-hover:scale-110"
              />
            ) : (
              <div
                className={cn(
                  'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[12px] font-bold shadow-sm ring-2 ring-white group-hover:ring-primary-200 transition-all group-hover:scale-110',
                  gradients[i % gradients.length]
                )}
              >
                {r.initials}
              </div>
            )}
            <span className="text-[10px] text-gray-500 font-medium max-w-[56px] text-center truncate leading-tight">
              {r.fullName.split(' ')[1] || r.fullName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────

export const FunderDashboard: FC = () => {
  const grants = [MOCK_GRANT, MOCK_GRANT_2];
  const [selectedGrantId, setSelectedGrantId] = useState<number | null>(null);
  const [detailGrantId, setDetailGrantId] = useState<number | null>(null);

  const handleViewMore = (grantId: number) => {
    setDetailGrantId(grantId);
    setSelectedGrantId(grantId);
  };

  const handleBack = () => {
    setDetailGrantId(null);
    setSelectedGrantId(null);
  };

  const detailGrant = detailGrantId ? grants.find((g) => g.id === detailGrantId) : null;

  const visibleGrants = selectedGrantId ? grants.filter((g) => g.id === selectedGrantId) : grants;

  return (
    <div>
      {/* Dashboard header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
            <img
              src={MOCK_FUNDER.avatarUrl}
              alt={MOCK_FUNDER.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-[18px] font-extrabold text-gray-900 tracking-tight">
              {MOCK_FUNDER.name}
            </h1>
            <p className="text-[12px] text-gray-400">Funder Dashboard</p>
          </div>
        </div>
        <GrantSelector
          grants={grants}
          selectedId={selectedGrantId}
          onChange={(id) => {
            setSelectedGrantId(id);
            setDetailGrantId(id);
          }}
        />
      </div>

      {/* Content */}
      {detailGrant ? (
        <GrantDetailView grant={detailGrant} onBack={handleBack} />
      ) : (
        <div className="space-y-6">
          {/* Cumulative stats */}
          <CumulativeStats grants={visibleGrants} />

          {visibleGrants.map((grant, i) => (
            <div key={grant.id} className="space-y-6">
              <GrantNewsSection grant={grant} onViewMore={handleViewMore} />
              {/* Show funded researchers after the first grant */}
              {i === 0 && visibleGrants.length > 1 && <FundedResearchersSection />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
