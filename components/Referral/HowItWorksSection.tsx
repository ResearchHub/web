'use client';

import Image from 'next/image';

export function HowItWorksSection() {
  const steps = [
    {
      image: '/referral/share_your_link.webp',
      title: 'Share Your Link',
      description: 'Share your unique referral link with potential funders, big or small',
      alt: 'Person sharing referral link from laptop',
    },
    {
      image: '/referral/user_funds_research.webp',
      title: 'User Funds Research',
      description: 'Referred user funds a proposal on ResearchHub',
      alt: 'Person funding research with flask',
    },
    {
      image: '/referral/you_both_rewarded.webp',
      title: 'You Both Get Rewarded',
      description:
        'You both receive 10% of their funded amount in credits to support more research',
      alt: 'Two people holding reward coins',
    },
  ];

  return (
    <section className="bg-white mb-12">
      <h2 className="text-2xl sm:!text-3xl font-bold text-center mb-10 text-gray-800">
        How It Works
      </h2>

      <div className="grid grid-cols-1 sm:!grid-cols-3 gap-2 sm:!gap-8 max-w-6xl mx-auto px-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="mb-4 w-full max-w-[200px] h-[200px] flex items-center justify-center">
              <Image
                src={step.image}
                alt={step.alt}
                width={200}
                height={200}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 className="text-lg sm:!text-xl font-semibold mb-2 text-gray-800 h-auto sm:!h-12 sm:!flex items-center justify-center sm:!leading-tight">
              {step.title}
            </h3>
            <p className="text-sm sm:!text-base text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
