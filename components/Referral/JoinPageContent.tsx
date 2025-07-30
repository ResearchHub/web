'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift,
  faUsers,
  faMicroscope,
  faCalculator,
  faShareAlt,
  faChartLine,
} from '@fortawesome/pro-light-svg-icons';
import { UserPlus } from 'lucide-react';
import Image from 'next/image';

export function JoinPageContent() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { showAuthModal } = useAuthModalContext();

  // Redirect authenticated users to trending page
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/trending');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSignup = () => {
    showAuthModal();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:!p-6 lg:!p-8">
      <header className="text-center mb-12">
        <div className="flex flex-col items-center gap-3 mt-4 mb-8">
          <div className="flex items-center justify-center">
            <Image
              src="/referral/admit_one2.png"
              alt="Admission ticket"
              width={250}
              height={250}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Join ResearchHub</h1>
          <p className="text-lg text-gray-600 text-center max-w-xl">
            Joining is free and will earn you funding credits for every research proposal you fund.
          </p>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faGift} className="h-4 w-4 mr-2" />
            You've been invited! 🎉
          </div>
        </div>
      </header>

      <main>
        {/* How It Works */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-12 border-4 border-blue-500">
          <h2 className="text-2xl sm:!text-3xl font-bold text-center mb-8 text-gray-800">
            Earn 10% on Every Proposal You Fund
          </h2>
          <div className="grid md:!grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Join ResearchHub</h3>
              <p className="text-gray-600">
                Create your account and become part of our research community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FontAwesomeIcon icon={faMicroscope} className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Fund Research</h3>
              <p className="text-gray-600">
                Support groundbreaking research projects that matter to you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FontAwesomeIcon icon={faGift} className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Earn 10% Bonus</h3>
              <p className="text-gray-600">
                Earn a 10% funding credit bonus on every proposal you fund which can be used to fund
                more research, including your own!
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg shadow-md mb-12 text-white">
          <h2 className="text-2xl sm:!text-3xl font-bold text-center mb-6">Let's get started!</h2>
          <div className="text-center">
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Create your account and start earning referral bonuses with your invite!
            </p>
            <Button
              size="lg"
              onClick={handleSignup}
              className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
            >
              Create Account & Start Earning
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
