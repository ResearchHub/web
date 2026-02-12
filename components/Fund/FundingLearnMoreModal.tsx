'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { DollarSign, Zap, CheckCircle, Users, MousePointerClick, ArrowRight } from 'lucide-react';

interface FundingLearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const benefits = [
  {
    title: 'More research per dollar',
    description:
      'Funds do not incur the traditional 40-60% indirect university fees, letting you fund twice the science with the same budget.',
    icon: <DollarSign className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'Faster funding',
    description:
      'Funding becomes usable for researchers at their universities days to weeks after funding, not months to years.',
    icon: <Zap className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'More reproducible',
    description:
      'Funds exclusively go to preregistered experiments, which have much higher reproducibility rates than traditional closed access grant applications.',
    icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'Expert opinions',
    description:
      'We pay experts $150 to provide an open-access, unblinded peer review of all experiments to give funders more context into quality and impact.',
    icon: <Users className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'Ease',
    description:
      '1-click fund any research project from a credit card (+Apple Pay/Google Pay), Donor Advised Fund, or in-app currency.',
    icon: <MousePointerClick className="w-5 h-5 text-blue-600" />,
  },
];

export const FundingLearnMoreModal = ({ isOpen, onClose }: FundingLearnMoreModalProps) => {
  const router = useRouter();

  const handlePostOpportunity = () => {
    onClose();
    router.push('/opportunity/create');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Why Fund on ResearchHub?"
      maxWidth="max-w-xl"
      footer={
        <Button onClick={handlePostOpportunity} variant="default" className="w-full">
          Post Funding Opportunity
          <ArrowRight size={16} className="ml-2" />
        </Button>
      }
    >
      <div className="space-y-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{benefit.title}</h3>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};
