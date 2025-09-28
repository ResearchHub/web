'use client';

import React, { useState, useEffect } from 'react';
import { OnboardingTopicSelector } from './OnboardingTopicSelector';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Topic } from '@/types/topic';
import { Logo } from '@/components/ui/Logo';
import { useFollowContext } from '@/contexts/FollowContext';

interface WelcomeTextProps {
  onAnimationComplete: () => void;
}

function WelcomeText({ onAnimationComplete }: WelcomeTextProps) {
  useEffect(() => {
    const mainText = 'Welcome to ResearchHub';
    const subtext = "Let's get going";

    // Calculate timing
    const mainTextTime = mainText.length * 30 + 600; // Main text animation
    const subtextDelay = 1000; // 1 second after main text
    const subtextTime = subtext.length * 20 + 600; // Subtext animation (20ms per char for faster reveal)
    const finalDelay = 1000; // 1 second after subtext finishes

    const totalTime = mainTextTime + subtextDelay + subtextTime + finalDelay;

    const timer = setTimeout(() => {
      onAnimationComplete();
    }, totalTime);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const mainText = 'Welcome to ResearchHub';
  const subtext = "Let's set up your research feed";
  const mainTextAnimationTime = mainText.length * 30 + 600;
  const subtextStartDelay = mainTextAnimationTime + 1000; // Start 1 second after main text finishes

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20">
      <div className="text-center px-4">
        <div className="mb-8 flex justify-center">
          <Logo variant="white" noText size={66} />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          {mainText.split('').map((char, index) => (
            <span
              key={index}
              className="inline-block transition-all duration-600"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 30}ms forwards`,
                opacity: 0,
                transform: 'translateY(20px)',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl text-white/90">
          {subtext.split('').map((char, index) => (
            <span
              key={index}
              className="inline-block transition-all duration-600"
              style={{
                animation: `fadeInUp 0.6s ease-out ${subtextStartDelay + index * 20}ms forwards`,
                opacity: 0,
                transform: 'translateY(20px)',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </p>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface NewUserOnboardingProps {
  backgroundVariant?: 'waves' | 'grid';
}

export function NewUserOnboarding({ backgroundVariant = 'grid' }: NewUserOnboardingProps) {
  const [initialTopics, setInitialTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { followMultiple } = useFollowContext();

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleAnimationComplete = () => {
    setShowWelcome(false);
    setShowModal(true);
  };

  const handleContinue = async () => {
    if (selectedTopicIds.length === 0) return;

    setIsSaving(true);
    try {
      // Use the batch follow endpoint
      await followMultiple(selectedTopicIds);

      // Navigate to feed after successful save
      router.push('/feed');
    } catch (error) {
      console.error('Failed to follow topics:', error);
      setIsSaving(false);
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundVariant === 'grid') {
      return {
        background:
          'linear-gradient(to bottom,rgb(41, 104, 240) 0%, #0153FF 10%,rgb(205, 115, 221) 100%)',
      };
    }
    return {
      backgroundImage: 'url(/wavy.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Grid overlay for grid variant */}
      {backgroundVariant === 'grid' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Show welcome text */}
      {showWelcome && <WelcomeText onAnimationComplete={handleAnimationComplete} />}

      {/* Logo at the top */}
      {showModal && (
        <div className="relative z-10 flex justify-center pt-8 mb-12">
          <Logo variant="white" size={60} />
        </div>
      )}

      {/* Modal-style container */}
      {showModal && (
        <div className="relative z-10 flex items-center justify-center px-4 min-h-[calc(100vh-200px)] animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] max-h-[80vh] animate-slide-up">
            <div className="p-8 pb-4 flex-1 flex flex-col min-h-0">
              <div className="mb-8 text-center flex-shrink-0">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Interests</h1>
                <p className="text-gray-600">
                  Select the research areas you'd like to see in your feed.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pb-4 min-h-0">
                <OnboardingTopicSelector
                  topics={initialTopics}
                  selectedTopicIds={selectedTopicIds}
                  onTopicToggle={handleTopicToggle}
                  className="[&_.grid]:!grid-cols-2 [&_.grid]:sm:!grid-cols-3 [&_.grid]:lg:!grid-cols-3"
                />
              </div>
            </div>

            {/* Sticky footer inside modal */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
              <Button
                variant="default"
                size="lg"
                onClick={handleContinue}
                disabled={selectedTopicIds.length === 0 || isSaving}
                className="w-full bg-[#0153FF] text-white hover:bg-[#0142CC] disabled:bg-gray-300 disabled:text-gray-600"
              >
                {isSaving
                  ? 'Saving...'
                  : selectedTopicIds.length === 0
                    ? 'Continue (0 of 1 selected)'
                    : `Continue (${selectedTopicIds.length} selected)`}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
