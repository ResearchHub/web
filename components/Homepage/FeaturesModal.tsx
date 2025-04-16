'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Icon, IconName } from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useUser } from '@/contexts/UserContext';
import { useSearchParams } from 'next/navigation';
import { Slideshow } from '@/components/ui/Slideshow';

// Define features array
const features = [
  {
    title: 'Earn 150 USD for Peer Reviews',
    description: 'Get paid to peer-review papers based on your expertise.',
    cta: 'Become a Reviewer',
    link: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    icon: 'solidEarn',
  },
  {
    title: 'Fund Promising Research',
    description:
      'Funders: Fund promising research via RSC. Researchers: Get your experiment funded.',
    cta: 'Explore Funding',
    link: '/fund',
    icon: 'solidHand',
  },
  {
    title: 'Discover and Discuss Science',
    description: 'Discuss papers with the community and get customized content recommendations.',
    cta: 'Browse Papers',
    link: '/',
    icon: faComments,
  },
  {
    title: 'Publish in the RH Journal',
    description: "Increase your paper's impact and visibility by publishing in the RH journal.",
    cta: 'Submit Manuscript',
    link: '/paper/create',
    icon: 'rhJournal2',
  },
];

export function FeaturesModal() {
  // Core state
  const featureName = 'homepage_features_modal';
  const { user } = useUser();
  const searchParams = useSearchParams();
  const forceShow = searchParams.get('showFeatures') === 'true';
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(featureName);

  // Determine if modal should be open
  const isOpen =
    forceShow ||
    (dismissStatus === 'checked' &&
      !isDismissed &&
      !!user &&
      user?.hasCompletedOnboarding === true);

  const closeModal = () => {
    dismissFeature();
  };

  // Return null if conditions not met
  if (!forceShow && (dismissStatus !== 'checked' || isDismissed || !user)) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeModal}
      maxWidth="max-w-lg"
      padding="p-0"
      showCloseButton={true}
    >
      <div className="p-5 flex flex-col w-full min-h-[70vh] md:min-h-0 justify-between md:justify-start md:w-96 lg:w-[500px]">
        {/* Modal header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome to ResearchHub!</h2>
          <p className="text-sm text-gray-600">Take a quick tour of key features:</p>
        </div>

        {/* Feature slides using Slideshow component */}
        <Slideshow className="mb-4 w-full flex-1 flex items-center justify-center md:flex-none">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-blue-50 rounded-lg p-4 flex flex-col items-center w-full"
            >
              {/* Icon */}
              <div className="mb-3">
                {typeof feature.icon === 'string' ? (
                  <Icon name={feature.icon as IconName} size={40} color="#4f46e5" />
                ) : (
                  <FontAwesomeIcon icon={feature.icon} className="text-indigo-600" size="2x" />
                )}
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg mb-2 text-center">{feature.title}</h3>
              <p className="text-center text-sm text-gray-600 mb-3">{feature.description}</p>

              {/* CTA Button */}
              <Link
                href={feature.link}
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                {feature.cta}
              </Link>
            </div>
          ))}
        </Slideshow>

        {/* Close button */}
        <Button onClick={closeModal} variant="default" size="lg" className="w-full">
          Got it
        </Button>
      </div>
    </BaseModal>
  );
}
