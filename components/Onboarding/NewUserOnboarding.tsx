'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OnboardingTopicSelector } from './OnboardingTopicSelector';
import { Button } from '@/components/ui/Button';
import { useSearchParams, usePathname } from 'next/navigation';
import { Topic } from '@/types/topic';
import { useFollowContext } from '@/contexts/FollowContext';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/user.service';
import { BaseModal } from '@/components/ui/BaseModal';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

interface NewUserOnboardingProps {
  // Optional props for external state management
  selectedTopicIds?: number[];
  onTopicToggle?: (topicId: number) => void;
}

export function NewUserOnboarding({
  selectedTopicIds: externalSelectedTopicIds,
  onTopicToggle: externalOnTopicToggle,
}: NewUserOnboardingProps) {
  const [initialTopics, setInitialTopics] = useState<Topic[]>([]);
  const [internalSelectedTopicIds, setInternalSelectedTopicIds] = useState<number[]>([]);
  console.log('TEST');
  // Use external state if provided, otherwise use internal state
  const selectedTopicIds = externalSelectedTopicIds ?? internalSelectedTopicIds;
  const setSelectedTopicIds = setInternalSelectedTopicIds;

  useEffect(() => {
    // Fetch initial topics using the hub service
    const fetchTopics = async () => {
      try {
        // Import HubService dynamically to avoid client-side issues
        const { HubService } = await import('@/services/hub.service');
        const topics = await HubService.getPrimaryHubs();
        setInitialTopics(topics || []);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setInitialTopics([]);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicToggle = (topicId: number) => {
    if (externalOnTopicToggle) {
      externalOnTopicToggle(topicId);
    } else {
      setSelectedTopicIds((prev) =>
        prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
      );
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Research areas</h1>
          <p className="text-gray-600">Select the research areas you'd like to see in your feed.</p>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="px-8 pb-4">
        <OnboardingTopicSelector
          topics={initialTopics}
          selectedTopicIds={selectedTopicIds}
          onTopicToggle={handleTopicToggle}
          className="[&_.grid]:!grid-cols-2 [&_.grid]:sm:!grid-cols-3 [&_.grid]:lg:!grid-cols-3"
        />
      </div>
    </>
  );
}

/**
 * Wrapper component that handles the trigger logic for showing the onboarding modal.
 * This should be placed in the main layout to automatically show onboarding when needed.
 */
export function OnboardingModalWrapper() {
  const { user, isLoading: isUserLoading, refreshUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const onboardingEventFired = useRef(false);
  const hasCompletedOnboarding = useRef(false);
  const pathname = usePathname();
  const { followMultiple } = useFollowContext();

  // Add ?onboarding=true to URL when modal is shown
  useEffect(() => {
    if (typeof window === 'undefined' || !showModal) return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has('onboarding')) {
      url.searchParams.append('onboarding', 'true');
      window.history.replaceState({}, '', url.toString());
    }
  }, [showModal]);

  // Check if onboarding should be shown
  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    // Skip if user has already completed onboarding in this session
    if (hasCompletedOnboarding.current) {
      return;
    }

    // Skip onboarding for /feed page - they'll use the new onboarding
    // Skip onboarding for /fund/* pages - users signing up via fundraise flow shouldn't be interrupted
    if (pathname === '/feed' || pathname.startsWith('/fund')) {
      return;
    }

    const shouldShowOnboarding =
      UserService.shouldRedirectToOnboarding(user) || searchParams.get('onboarding') === 'true';

    // Log analytics event when onboarding is viewed
    if (
      shouldShowOnboarding &&
      user &&
      user.hasCompletedOnboarding === false &&
      !onboardingEventFired.current
    ) {
      AnalyticsService.logEvent(LogEvent.ONBOARDING_VIEWED);
      onboardingEventFired.current = true;
    }

    setShowModal(shouldShowOnboarding);
  }, [user, isUserLoading, searchParams, pathname]);

  // Mark onboarding as completed when modal is shown
  useEffect(() => {
    const markOnboardingCompleted = async () => {
      try {
        await UserService.setCompletedOnboarding();
      } catch (error) {
        console.error('Error automatically marking onboarding as completed:', error);
      }
    };

    if (showModal) {
      markOnboardingCompleted();
    }
  }, [showModal]);

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleContinue = async () => {
    if (selectedTopicIds.length === 0) return;

    setIsSaving(true);
    try {
      // Follow topics and mark onboarding as completed in parallel
      await Promise.all([followMultiple(selectedTopicIds), UserService.setCompletedOnboarding()]);

      // Refresh user context to get updated hasCompletedOnboarding flag
      await refreshUser();

      // Mark as completed locally to prevent modal from reopening
      hasCompletedOnboarding.current = true;

      // Remove onboarding query parameter from URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('onboarding');
        window.history.replaceState({}, '', url.toString());
      }

      // Close the modal and leave user on current page
      setShowModal(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSaving(false);
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <BaseModal
      isOpen={showModal}
      showCloseButton={false}
      onClose={() => {}} // We don't want users to close the modal
      title=""
      padding="p-0"
      className="!w-full md:!w-[700px]"
      footer={
        <Button
          variant="default"
          size="lg"
          onClick={handleContinue}
          disabled={selectedTopicIds.length === 0 || isSaving}
          className="w-full bg-[#0153FF] text-white hover:bg-[#0142CC] disabled:bg-[#0153FF]/60 disabled:text-white/90"
        >
          {isSaving ? 'Setting up your feed...' : 'Continue'}
        </Button>
      }
    >
      <NewUserOnboarding selectedTopicIds={selectedTopicIds} onTopicToggle={handleTopicToggle} />
    </BaseModal>
  );
}
