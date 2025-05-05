import React, { FC } from 'react';
import { FeatureCard } from './FeatureCard';
import { BookPlus, Zap, Coins, ChartLine } from 'lucide-react';

export const JournalFeatures: FC = () => {
  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-medium text-gray-900 mb-4 text-left">About this journal</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto text-left">
          The ResearchHub Journal aims to accelerate the pace of science through novel incentive
          structures that reward authors for reproducible research and compensate peer reviewers for
          their expertise. Authors receive rapid, constructive feedback through 2+ expert open peer
          reviews.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 text-left">
          <FeatureCard icon={BookPlus} title="Preprint Publication">
            <p>Immediate early sharing of research, at no cost.</p>
          </FeatureCard>
          <FeatureCard icon={Zap} title="Rapid Turnaround">
            <ul className="list-disc pl-5 space-y-1">
              <li>14 days: Peer reviews done</li>
              <li>21 days: Publication decision</li>
            </ul>
          </FeatureCard>
          <FeatureCard icon={Coins} title="$150 to Peer Reviewers">
            <p>A scientist's time and expertise is valuable. We pay for peer review.</p>
          </FeatureCard>
          <FeatureCard icon={ChartLine} title="Maximize Your Impact">
            <p>Tap into a social network that gets more eyes on your research.</p>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
};
