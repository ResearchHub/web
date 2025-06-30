'use client';

import { Share2, FlaskConical, HandCoins } from 'lucide-react';

const steps = [
  {
    icon: <Share2 className="h-10 w-10 text-blue-500" />,
    title: '1. Share Your Link',
    description: 'Distribute your unique referral link via social media, email, or directly.',
  },
  {
    icon: <FlaskConical className="h-10 w-10 text-orange-500" />,
    title: '2. User Funds',
    description: 'When someone joins using your link and funds a project, you both win.',
  },
  {
    icon: <HandCoins className="h-10 w-10 text-green-500" />,
    title: '3. You Both Earn Credits',
    description:
      'You and your referred funder both receive 10% of the funded amount as platform credits.',
  },
];

export function IllustratedGuide() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative flex flex-col p-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-6 mb-10 last:mb-0">
            <div className="relative flex flex-col items-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 z-10 shrink-0">
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-10 h-full w-0.5 bg-gray-200 mt-2"></div>
              )}
            </div>
            <div className="pt-2 text-left">
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
