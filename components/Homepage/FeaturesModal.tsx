'use client';

import { useState, useEffect, Fragment } from 'react';
import { Slideshow } from '@/components/ui/Slideshow';
import { Button } from '@/components/ui/Button';
import Confetti from 'react-confetti';
import Link from 'next/link';
import { Icon, IconName } from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useUser } from '@/contexts/UserContext';
import { useSearchParams } from 'next/navigation';

// Define Feature type with icon
interface Feature {
  title: string;
  description: string | React.ReactNode;
  cta: string;
  link: string;
  icon: IconName | typeof faComments;
}

const features: Feature[] = [
  {
    title: 'Earn 150 USD for Peer Reviews',
    description: 'Get paid to peer-review papers based on your expertise.',
    cta: 'Become a Reviewer',
    link: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    icon: 'solidEarn',
  },
  {
    title: 'Fund Promising Research',
    description: (
      <ul className="list-disc pl-4 text-left space-y-1.5">
        <li>
          <strong>Funders:</strong> Fund promising research via RSC
        </li>
        <li>
          <strong>Researchers:</strong> Get your experiment funded
        </li>
      </ul>
    ),
    cta: 'Explore Funding',
    link: '/fund',
    icon: 'solidHand',
  },
  {
    title: 'Discover and Discuss Science',
    description: (
      <ul className="list-disc pl-4 text-left space-y-1.5">
        <li>Discuss any paper with the ResearchHub community</li>
        <li>Get customized content recommendations based on your expertise</li>
      </ul>
    ),
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
  // Define feature name
  const featureName = 'homepage_features_modal';

  // Get user state
  const { user } = useUser();

  // Get search params to check for force show parameter
  const searchParams = useSearchParams();
  const forceShow = searchParams.get('showFeatures') === 'true';

  // Use the dismissable feature hook
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(featureName);

  // State for confetti, controlled by the hook status
  const [showConfetti, setShowConfetti] = useState(false);
  // Local state to track if confetti has been shown this session,
  // prevents confetti on subsequent opens if dismissed via localStorage then logged in.
  const [confettiShown, setConfettiShown] = useState(false);

  // Determine if the modal should be open
  // Show if forced via query param OR if the status is checked, the feature is not dismissed, and user is logged in
  const isOpen =
    forceShow ||
    (dismissStatus === 'checked' &&
      !isDismissed &&
      !!user &&
      user?.hasCompletedOnboarding === true);

  // Effect to trigger confetti only once when the modal opens for the first time
  useEffect(() => {
    if (isOpen && !confettiShown) {
      setShowConfetti(true);
      setConfettiShown(true); // Mark confetti as shown
    }
    // Don't show confetti again if modal re-opens (e.g., due to state change)
    // unless confettiShown is reset elsewhere (which it isn't here).
  }, [isOpen, confettiShown]);

  const closeModal = () => {
    // Call dismissFeature to mark it dismissed via API or localStorage
    dismissFeature();
    // Note: The modal will close automatically on the next render because
    // `isDismissed` will become true (optimistically) or the hook will re-run.
    // We don't need setIsOpen(false) anymore.
    setShowConfetti(false); // Stop confetti if the button is clicked
  };

  // Return null only if not forced via query param AND one of the conditions is not met
  if (!forceShow && (dismissStatus !== 'checked' || isDismissed || !user)) {
    return null;
  }

  return (
    <BaseModal
      // isOpen is now derived directly from the hook state
      isOpen={isOpen}
      // onClose should still call our dismiss logic
      onClose={closeModal}
      // Make modal wider
      maxWidth="max-w-xl"
      padding="p-0"
      showCloseButton={false}
    >
      {/* Show confetti only when isOpen and showConfetti state is true */}
      {isOpen && showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          initialVelocityY={-15}
          wind={0.01}
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
          onConfettiComplete={() => setShowConfetti(false)} // Keep this to remove confetti element after animation
        />
      )}

      <div className="p-8 flex flex-col h-full">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Welcome to ResearchHub!</h2>
          <p className="text-sm text-gray-600">Take a quick tour of key features:</p>
        </div>
        <div className="mb-8 max-w-[500px] mx-auto">
          <Slideshow>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col text-left p-6 min-h-[280px] bg-blue-50 rounded-lg"
              >
                <div className="mb-4 self-center">
                  {typeof feature.icon === 'string' ? (
                    <Icon name={feature.icon as IconName} size={46} color="#4f46e5" />
                  ) : (
                    <FontAwesomeIcon icon={feature.icon} className="text-indigo-600" size="3x" />
                  )}
                </div>
                <h3 className="font-semibold text-xl mb-2 text-gray-800">{feature.title}</h3>
                <div className="text-sm text-gray-600 mb-4 flex-grow max-w-xs">
                  {feature.description}
                </div>
                <Link
                  href={feature.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto relative z-10 text-primary-600 text-sm font-medium underline-offset-4 hover:underline focus:outline-none self-center"
                >
                  {feature.cta}
                </Link>
              </div>
            ))}
          </Slideshow>
        </div>
        <div className="text-center mt-auto pt-4">
          <Button onClick={closeModal} variant="default" size="lg">
            Got it
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
