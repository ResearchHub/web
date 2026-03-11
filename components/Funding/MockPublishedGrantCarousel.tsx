'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { Carousel } from '@/components/ui/Carousel';
import { Callout } from '@/components/ui/Callout';
import { Badge } from '@/components/ui/Badge';
import { RefreshCw, Building2 } from 'lucide-react';

interface MockExpert {
  name: string;
  title: string;
  institution: string;
  expertise: string[];
}

const MOCK_EXPERTS: MockExpert[] = [
  {
    name: 'Cédric Feschotte',
    title: 'Professor',
    institution: 'Cornell University',
    expertise: ['Transposable element evolution', 'genome annotation', 'TE biology'],
  },
  {
    name: 'Jerzy Jurka',
    title: 'Research Professor',
    institution: 'Genetic Information Research Institute',
    expertise: ['Transposable element classification', 'RepBase database development'],
  },
  {
    name: 'Hadi Quesneville',
    title: 'Research Director',
    institution: 'INRAE',
    expertise: ['Transposable element annotation', 'genome assembly', 'REPET pipeline'],
  },
  {
    name: 'Shujun Ou',
    title: 'Assistant Professor',
    institution: 'UC Davis',
    expertise: ['Transposable element detection', 'EDTA pipeline development', 'genome annotation'],
  },
  {
    name: 'Jullien Flynn',
    title: 'Researcher',
    institution: 'University of Arizona',
    expertise: ['RepeatModeler development', 'TE annotation methodology'],
  },
  {
    name: 'Emmanuelle Lerat',
    title: 'Professor',
    institution: 'Université Claude Bernard Lyon 1',
    expertise: ['Transposable element evolution', 'genome dynamics'],
  },
];

const ExpertCard: FC<{ expert: MockExpert }> = ({ expert }) => (
  <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 h-full">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-gray-900 text-sm leading-snug">{expert.name}</h3>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400"
        style={{ animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
      />
    </div>
    <span className="text-xs text-gray-500 mt-0.5">{expert.title}</span>

    <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-600">
      <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
      <span className="truncate">{expert.institution}</span>
    </div>

    <div className="flex flex-wrap gap-1.5 mt-3">
      {expert.expertise.map((tag) => (
        <Badge key={tag} variant="primary" size="sm">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

interface MockPublishedGrantCarouselProps {
  className?: string;
}

export const MockPublishedGrantCarousel: FC<MockPublishedGrantCarouselProps> = ({ className }) => {
  return (
    <section className={cn('py-5', className)}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <h2 className="text-xl font-bold text-gray-900">
          Transposable Element Annotation in Crops
        </h2>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-green-50 border border-green-200 text-green-700">
          $25K pool
        </span>
      </div>

      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600 flex-wrap">
        <span>ResearchHub Foundation</span>
        <span className="text-gray-300 text-[22px]">&bull;</span>
        <span className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Rolling fund
        </span>
        <span className="text-gray-300 text-[22px]">&bull;</span>
        <span>
          <span className="font-mono">{MOCK_EXPERTS.length}</span> experts invited
        </span>
      </div>

      <Callout
        variant="info"
        className="mt-4"
        message={
          <>
            We&apos;ve invited <strong>{MOCK_EXPERTS.length} experts</strong> to submit proposals
            for this opportunity. You&apos;ll be notified when proposals are submitted.
          </>
        }
      />

      <div className="mt-4">
        <Carousel>
          {MOCK_EXPERTS.map((expert) => (
            <div key={expert.name} className="flex-shrink-0 w-[260px] sm:w-[280px]">
              <ExpertCard expert={expert} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};
