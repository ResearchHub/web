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
import { useReferral } from '@/contexts/ReferralContext';

export function JoinPageContent() {
  const { referralCode } = useReferral();
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

  // Don't render anything if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  const handleSignup = () => {
    // No need to manually set sessionStorage - context handles it
    showAuthModal();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-12">
        <div className="flex justify-center items-center mb-4">
          <UserPlus className="h-10 w-10 mr-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Join ResearchHub Referral Program</h1>
        </div>

        {referralCode ? (
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <FontAwesomeIcon icon={faGift} className="h-4 w-4 mr-2" />
              You've been invited! 🎉
            </div>
            <p className="mt-4 text-lg text-gray-600">
              Someone you know wants you to join ResearchHub's referral program! Earn bonuses when
              you fund research and refer others to do the same.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-lg text-gray-600">
            Earn money while accelerating science. Join our referral program and get 10% bonuses on
            funding when you refer others to fund research projects.
          </p>
        )}
      </header>

      <main>
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg shadow-md mb-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-6">
            {referralCode ? 'Ready to start earning?' : 'Join the referral program'}
          </h2>
          <div className="text-center">
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              {referralCode
                ? 'Create your account and start earning referral bonuses with your invite!'
                : 'Sign up for free and start building your referral network to earn while accelerating science.'}
            </p>
            <Button
              size="lg"
              onClick={handleSignup}
              className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
            >
              {referralCode ? 'Create Account & Start Earning' : 'Join Referral Program'}
            </Button>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-12 border-4 border-blue-500">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            How the Referral Program Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FontAwesomeIcon icon={faShareAlt} className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Share Your Link</h3>
              <p className="text-gray-600">
                Get your unique referral link and share it with researchers, funders, and science
                enthusiasts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FontAwesomeIcon icon={faMicroscope} className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. They Fund Research</h3>
              <p className="text-gray-600">
                When someone uses your link and funds a research project, you both earn bonuses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Earn Together</h3>
              <p className="text-gray-600">
                Both you and your referral get a 10% bonus on their funding amount!
              </p>
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Calculate Your Earnings
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center mb-6">
                <FontAwesomeIcon icon={faCalculator} className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="text-xl font-semibold">Example: $1,000 Funding</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-700">You Receive</p>
                  <p className="text-2xl font-bold text-blue-600">$100</p>
                  <p className="text-sm text-gray-500">10% bonus</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <FontAwesomeIcon icon={faGift} className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-700">They Receive</p>
                  <p className="text-2xl font-bold text-green-600">$100</p>
                  <p className="text-sm text-gray-500">10% bonus</p>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-4">
                Win-win! Both parties earn bonuses while accelerating science.
              </p>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Image
                src="/people/maulik.jpeg"
                alt="Maulik"
                width={60}
                height={60}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="font-semibold mb-2">Dr. Maulik</h3>
              <p className="text-gray-600 text-sm mb-3">
                "Earned $2,150 in referral bonuses while helping fund breakthrough research."
              </p>
              <div className="text-green-600 font-semibold">$2,150 earned</div>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Image
                src="/people/emilio.jpeg"
                alt="Emilio"
                width={60}
                height={60}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="font-semibold mb-2">Dr. Emilio</h3>
              <p className="text-gray-600 text-sm mb-3">
                "Referred 15 researchers who funded $21,500 in total research projects."
              </p>
              <div className="text-green-600 font-semibold">15 referrals</div>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Image
                src="/people/dominikus_brian.jpeg"
                alt="Brian"
                width={60}
                height={60}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="font-semibold mb-2">Dr. Brian</h3>
              <p className="text-gray-600 text-sm mb-3">
                "Built a network of funders while earning passive income from referrals."
              </p>
              <div className="text-green-600 font-semibold">$1,800 earned</div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Join thousands earning through referrals:
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">$500K+</div>
              <div className="text-gray-600">Total bonuses earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">2,500+</div>
              <div className="text-gray-600">Active referrers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">15K+</div>
              <div className="text-gray-600">Successful referrals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">$2.1M</div>
              <div className="text-gray-600">Research funded</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
