'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@headlessui/react';
import { ArrowRight, Check } from 'lucide-react';

type PublishOption = 'preprint' | 'peer-reviewed' | null;

export function SubmissionTiers() {
  const router = useRouter();

  const publishOptions = [
    {
      id: 'preprint',
      type: 'Preprint',
      title: 'Free',
      tagline: 'Share your research instantly',
      route: '/paper/preprint',
      benefits: [
        {
          text: 'Open Access with citable DOI',
        },
        {
          text: 'Earn RSC when your preprint gets cited',
        },
        {
          text: 'Get feedback from the ResearchHub community',
        },
      ],
      borderColor: 'border-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'peer-reviewed',
      type: 'Peer Reviewed Publication',
      title: '$100',
      titleStrike: '$1,000',
      tagline: 'Everything in Preprint, plus',
      route: '/paper/journal-submit',
      benefits: [
        {
          text: 'Peer reviewed in 14 days by three experts',
        },
        {
          text: 'Accredited publication',
        },
        {
          text: 'Flat fee of $100',
        },
      ],
      borderColor: 'border-indigo-600',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return (
    <div className="space-y-8">
      <RadioGroup value={null} onChange={() => {}}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {publishOptions.map((option) => {
            return (
              <RadioGroup.Option
                key={option.id}
                value={option.id}
                className={({ checked }) =>
                  `relative flex cursor-pointer rounded-2xl focus:outline-none transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl h-full border border-gray-200 ${
                    checked ? 'shadow-lg' : ''
                  }`
                }
              >
                {({ checked }) => (
                  <Link href={option.route} className="flex flex-col w-full p-6 md:p-8">
                    <div className="flex flex-col">
                      <RadioGroup.Label
                        as="span"
                        className="text-xl md:text-xl font-medium text-gray-900"
                      >
                        {option.type}
                      </RadioGroup.Label>

                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-semibold tracking-tight text-gray-900">
                          {option.title}
                        </span>
                        {option.titleStrike && (
                          <span className="ml-2 text-xl text-gray-400">
                            <s>{option.titleStrike}</s>
                          </span>
                        )}
                      </div>

                      <div className="w-full h-px bg-gray-200 my-6"></div>

                      <span className="text-base text-gray-600">{option.tagline}</span>
                    </div>

                    <ul className="mt-6 space-y-4 flex-grow">
                      {option.benefits.map((benefit, index) => {
                        return (
                          <li key={index} className="flex items-center text-base text-gray-600">
                            <div className="mr-3 text-gray-900">
                              <Check className="h-5 w-5" />
                            </div>
                            <span>{benefit.text}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-8">
                      <Button
                        variant={option.id === 'peer-reviewed' ? 'default' : 'ghost'}
                        size="lg"
                        className={`w-full justify-center ${
                          option.id === 'peer-reviewed'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        GET STARTED
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </Link>
                )}
              </RadioGroup.Option>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
