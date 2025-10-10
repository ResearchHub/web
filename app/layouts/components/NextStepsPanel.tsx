'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  MessageCircle,
  CheckCircle,
  Circle,
  Camera,
  FileText,
  Shield,
  BookOpen,
  Info,
  Share2,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { calculateProfileCompletion, ProfileField } from '@/utils/profileCompletion';
import { cn } from '@/utils/styles';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface NextStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  icon: React.ReactNode;
}

const NextStepsPanelComponent = () => {
  const { user } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show panel if user is not logged in or has been dismissed
  if (!user || isDismissed) {
    return null;
  }

  const profileCompletion = calculateProfileCompletion(user);
  const missing = profileCompletion.missing;

  // Define the steps based on missing profile fields
  const steps: NextStep[] = [
    {
      id: 'basic-info',
      title: 'Complete basic info',
      description: 'Photo, education, about',
      completed: ![ProfileField.Photo, ProfileField.Education, ProfileField.About].some((field) =>
        missing.includes(field)
      ),
      href: '/onboarding',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'verify-profile',
      title: 'Verify your profile',
      description: 'Improve credibility on platform',
      completed: !missing.includes(ProfileField.Verification),
      href: '/onboarding',
      icon: <VerifiedBadge size="md" variant="outlined" />,
    },
    {
      id: 'social-presence',
      title: 'Add social presence',
      description: 'LinkedIn, Google Scholar, ...',
      completed: !missing.includes(ProfileField.Social),
      href: '/onboarding',
      icon: <Share2 className="w-5 h-5" />,
    },
  ];

  // Show all three steps
  const incompleteSteps = steps;

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-4 relative">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-blue-100 transition-colors duration-150 group"
        aria-label="Dismiss next steps panel"
      >
        <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
      </button>

      <div className="flex items-center gap-2 mb-3 pr-8">
        <RadiatingDot
          size={24}
          dotSize={8}
          color="bg-blue-600"
          radiateColor="bg-blue-400"
          ringColor="border-transparent"
          isRadiating={true}
        />
        <h3 className="text-sm font-semibold text-blue-900">Complete your Profile</h3>
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
          <span>Profile completion</span>
          <span>{profileCompletion.percent}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${profileCompletion.percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {incompleteSteps.map((step, index) => (
          <Link key={step.id} href={step.href} className="block group">
            <div className="flex items-center justify-between py-2 px-1 rounded-md hover:bg-blue-100 transition-colors duration-150">
              {/* Left side - Icon and content */}
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 text-blue-600">{step.icon}</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      'text-sm font-medium transition-colors',
                      step.completed
                        ? 'text-gray-600 line-through'
                        : 'text-gray-900 group-hover:text-blue-700'
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>

              {/* Right chevron */}
              <div className="flex items-center justify-center ml-2">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const NextStepsPanel = memo(NextStepsPanelComponent);
NextStepsPanel.displayName = 'NextStepsPanel';
