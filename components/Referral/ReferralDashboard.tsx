'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicroscope } from '@fortawesome/pro-light-svg-icons';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { ReferralCalculator } from '.';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  FlaskConical,
  Share2,
  UserPlus,
  Loader2,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { Tooltip } from '@/components/ui/Tooltip';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { BaseModal } from '@/components/ui/BaseModal';
import { useUser } from '@/contexts/UserContext';
import { useReferralMetrics, useReferralNetworkDetails } from '@/hooks/useReferral';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '../ui/AuthorTooltip';

const USERS_PER_PAGE = 5;

export function ReferralDashboard() {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { user: currentUser, isLoading: userLoadingUser } = useUser();
  const referralCode = currentUser?.referralCode;
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://researchhub.com'}/referral/join?refr=${referralCode}`;

  // Use the new hooks
  const { metrics, isLoading: metricsLoading, error: metricsError } = useReferralMetrics();
  const {
    networkDetails,
    isLoading: networkLoading,
    error: networkError,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
  } = useReferralNetworkDetails(USERS_PER_PAGE);

  const isLoading = metricsLoading || userLoadingUser;

  // Refs for animation targets
  const referredUsersRef = useRef<HTMLParagraphElement>(null);
  const amountFundedRef = useRef<HTMLParagraphElement>(null);
  const creditsEarnedRef = useRef<HTMLParagraphElement>(null);

  // Use real data from API or fallback to mock data
  const displayData = {
    referredUsersCount: metrics?.referralActivity.fundersInvited || 0,
    amountFundedByReferred: metrics?.networkFundingPower.breakdown.networkFunding || 0,
    creditsEarned: metrics?.yourFundingCredits.available || 0,
  };

  const displayUsers = networkDetails.map((user) => ({
    name: user.fullName,
    avatarUrl: user.profileImage,
    totalFunded: user.totalFunded,
    creditsEarned: user.referralBonusEarned,
    dateJoined: new Date(user.signupDate).toLocaleDateString(),
    authorId: user.authorId,
  }));

  useEffect(() => {
    const referredUsersEl = referredUsersRef.current;
    const amountFundedEl = amountFundedRef.current;
    const creditsEarnedEl = creditsEarnedRef.current;

    if (!referredUsersEl || !amountFundedEl || !creditsEarnedEl || metricsLoading || networkLoading)
      return;

    const animateValue = (el: HTMLParagraphElement, endValue: number, isCurrency: boolean) => {
      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: endValue,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (isCurrency) {
            el.textContent = `$${Math.round(proxy.value).toLocaleString()}`;
          } else {
            el.textContent = Math.round(proxy.value).toString();
          }
        },
      });
    };

    // Stagger the animations correctly using timeline.call()
    const tl = gsap.timeline();
    tl.call(() => animateValue(referredUsersEl, displayData.referredUsersCount, false), [], 0.1)
      .call(() => animateValue(amountFundedEl, displayData.amountFundedByReferred, true), [], 0.3)
      .call(() => animateValue(creditsEarnedEl, displayData.creditsEarned, true), [], 0.5);
  }, [metricsLoading, networkLoading, displayData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setIsCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy referral link.');
      }
    );
  };

  const shareOnX = () => {
    const text = `Join me on ResearchHub and let's accelerate science together! We both get a 10% bonus on funding. #ResearchHub #Science`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const text = `Join me on ResearchHub, a platform for accelerating science. When you join and fund a project, we both get a 10% bonus. Let's make an impact together.`;
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      referralLink
    )}&title=${encodeURIComponent('Join ResearchHub')}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnBlueSky = () => {
    const text = `Join me on ResearchHub and let's accelerate science together! We both get a 10% bonus on funding. ${referralLink}`;
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated.
  // This is handled by the middleware.
  // There is a redirect to the login page.
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center items-start mb-4 ">
            <UserPlus className="h-10 w-10 mr-4" />
            <h1 className="text-3xl sm:!text-4xl font-bold text-gray-900">
              Refer a Funder, Accelerate Science
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-600">
            Earn credits by inviting funders to ResearchHub.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-md flex items-stretch overflow-hidden mb-12 border-4 border-blue-500">
          <div className="flex-grow p-6 md:p-8">
            <h2 className="text-xl sm:!text-2xl font-semibold mb-4">Your Referral Link</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleCopy}
                  variant="default"
                  className="w-full text-xs lg:!text-sm"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {isCopied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  onClick={() => setIsQrModalOpen(true)}
                  variant="outlined"
                  className="w-full text-xs lg:!text-sm"
                  aria-label="Show QR Code"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  <span>QR Code</span>
                </Button>
              </div>
              <div className="border-t border-gray-200"></div>
              <div className="flex items-center justify-start gap-4">
                <p className="text-sm text-gray-500">Share on:</p>
                <Button onClick={shareOnX} variant="ghost" size="icon" aria-label="Share on X">
                  <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
                </Button>
                <Button
                  onClick={shareOnLinkedIn}
                  variant="ghost"
                  size="icon"
                  aria-label="Share on LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                </Button>
                <Button
                  onClick={shareOnBlueSky}
                  variant="ghost"
                  size="icon"
                  aria-label="Share on BlueSky"
                >
                  <FontAwesomeIcon icon={faBluesky} className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-80 relative flex-shrink-0">
            <Image
              src="/images/lab.jpg"
              alt="Science lab illustration"
              fill
              className="object-cover"
            />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl sm:!text-3xl font-bold text-center mb-10 text-gray-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="relative bg-blue-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
                <Share2 className="h-8 w-8 text-blue-600" />
                <span className="absolute top-0 right-0 bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-4 border-white">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
              <p className="text-gray-600 px-2">
                Share your unique referral link with potential funders, big or small.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faMicroscope} className="h-8 w-8 text-green-600" />
                <span className="absolute top-0 right-0 bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-4 border-white">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">User Funds Research</h3>
              <p className="text-gray-600 px-2">Referred user funds a proposal.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative bg-yellow-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-yellow-600" />
                <span className="absolute top-0 right-0 bg-yellow-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-4 border-white">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">You Both Get Rewarded</h3>
              <p className="text-gray-600 px-2">
                You both receive 10% of their funded amount in credits to support more research.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Referral Impact</h2>
          <div className="bg-green-50 p-6 rounded-xl text-center mb-6">
            <p ref={creditsEarnedRef} className="text-3xl sm:!text-4xl font-bold text-green-600">
              ${displayData.creditsEarned.toLocaleString()}
            </p>
            <p className="text-gray-600 mt-2 text-lg">Referral Credits Earned</p>
            <div className="mt-2">
              <Tooltip
                content={
                  <>
                    <p className="text-left mb-3 text-sm">
                      Credits earned must be used towards funding your own proposal or another
                      proposal on the platform.
                    </p>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/fund/needs-funding')}
                      >
                        <List className="h-4 w-4 mr-2" />
                        <span>View proposals</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/notebook?newFunding=true')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Create proposal</span>
                      </Button>
                    </div>
                  </>
                }
                position="top"
                width="w-[320px]"
              >
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-sm text-gray-500 hover:text-gray-700 underline inline-block"
                >
                  How can I use this?
                </a>
              </Tooltip>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p ref={referredUsersRef} className="text-3xl font-bold text-blue-600">
                {displayData.referredUsersCount}
              </p>
              <p className="text-gray-600 mt-2">Users Referred</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <FlaskConical className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p ref={amountFundedRef} className="text-3xl font-bold text-blue-600">
                ${displayData.amountFundedByReferred.toLocaleString()}
              </p>
              <p className="text-gray-600 mt-2">Funded by Your Referrals</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your Referred Users</h2>

          {displayUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referred users yet</h3>
              <p className="text-gray-500 mb-6 px-4">
                Share your referral link to start building your network and earning credits.
              </p>
              <Button
                onClick={() => {
                  document.querySelector('main')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                variant="default"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Link
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {displayUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center py-4 gap-3"
                  >
                    <AuthorTooltip authorId={user.authorId}>
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        size="md"
                        authorId={user.authorId}
                        className="mr-0 sm:mr-4"
                      />
                    </AuthorTooltip>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500">Joined: {user.dateJoined}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-600">Total Funded</p>
                        <p className="font-semibold text-green-600">
                          ${user.totalFunded.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-600">Credits Earned</p>
                        <p className="font-semibold text-blue-600">
                          ${user.creditsEarned.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button
                  onClick={goToPrevPage}
                  disabled={!hasPrevPage || networkLoading}
                  variant="outlined"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-gray-700 flex items-center gap-2 order-first sm:order-none">
                  Page {currentPage} of {totalPages}
                  {networkLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </span>
                <Button
                  onClick={goToNextPage}
                  disabled={!hasNextPage || networkLoading}
                  variant="outlined"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </section>

        <section className="mt-12">
          <ReferralCalculator />
        </section>
      </main>

      <BaseModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Scan QR Code"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-md inline-block">
            <QRCodeCanvas value={referralLink} size={192} bgColor="#f3f4f6" />
          </div>
          <p className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded break-words">
            {referralLink}
          </p>
        </div>
      </BaseModal>
    </div>
  );
}
