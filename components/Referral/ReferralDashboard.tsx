'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faQrcode } from '@fortawesome/pro-solid-svg-icons';
import { faMicroscope } from '@fortawesome/pro-light-svg-icons';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { ReferralCalculator } from '.';
import {
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  HelpCircle,
  FlaskConical,
  FileCheck,
  X,
  Share2,
  UserPlus,
} from 'lucide-react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { Tooltip } from '@/components/ui/Tooltip';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { BaseModal } from '@/components/ui/BaseModal';

// Mock data - replace with actual data from your backend
const referralData = {
  referralCode: 'YOUR-UNIQUE-CODE',
  referredUsersCount: 10,
  amountFundedByReferred: 21500,
  creditsEarned: 2150,
  proposalsFundedCount: 5,
  referredUsers: [
    {
      name: 'John Doe',
      avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
      totalFunded: 5000,
      creditsEarned: 500,
      dateJoined: 'Oct 26, 2022',
      pendingCredits: 150,
    },
    {
      name: 'Jane Smith',
      avatarUrl: 'https://randomuser.me/api/portraits/women/75.jpg',
      totalFunded: 2500,
      creditsEarned: 250,
      dateJoined: 'Nov 14, 2022',
    },
    {
      name: 'Sam Wilson',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      totalFunded: 3000,
      creditsEarned: 300,
      dateJoined: 'Dec 1, 2022',
      pendingCredits: 75,
    },
    {
      name: 'Emily Brown',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      totalFunded: 1500,
      creditsEarned: 150,
      dateJoined: 'Jan 5, 2023',
    },
    {
      name: 'Michael Johnson',
      avatarUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
      totalFunded: 500,
      creditsEarned: 50,
      dateJoined: 'Feb 12, 2023',
      pendingCredits: 25,
    },
    {
      name: 'Liam Garcia',
      avatarUrl: 'https://randomuser.me/api/portraits/men/61.jpg',
      totalFunded: 1000,
      creditsEarned: 100,
      dateJoined: 'Mar 3, 2023',
    },
    {
      name: 'Olivia Martinez',
      avatarUrl: 'https://randomuser.me/api/portraits/women/62.jpg',
      totalFunded: 2000,
      creditsEarned: 200,
      dateJoined: 'Mar 21, 2023',
    },
    {
      name: 'Noah Rodriguez',
      avatarUrl: 'https://randomuser.me/api/portraits/men/63.jpg',
      totalFunded: 4000,
      creditsEarned: 400,
      dateJoined: 'Apr 15, 2023',
    },
    {
      name: 'Emma Hernandez',
      avatarUrl: 'https://randomuser.me/api/portraits/women/64.jpg',
      totalFunded: 800,
      creditsEarned: 80,
      dateJoined: 'May 8, 2023',
    },
    {
      name: 'William Lopez',
      avatarUrl: 'https://randomuser.me/api/portraits/men/65.jpg',
      totalFunded: 1200,
      creditsEarned: 120,
      dateJoined: 'June 1, 2023',
    },
  ],
};

export function ReferralDashboard() {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const referralLink = `https://researchhub.com/join?refr=${referralData.referralCode}`;
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Refs for animation targets
  const referredUsersRef = useRef<HTMLParagraphElement>(null);
  const amountFundedRef = useRef<HTMLParagraphElement>(null);
  const creditsEarnedRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const referredUsersEl = referredUsersRef.current;
    const amountFundedEl = amountFundedRef.current;
    const creditsEarnedEl = creditsEarnedRef.current;

    if (!referredUsersEl || !amountFundedEl || !creditsEarnedEl) return;

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
    tl.call(() => animateValue(referredUsersEl, referralData.referredUsersCount, false), [], 0.1)
      .call(() => animateValue(amountFundedEl, referralData.amountFundedByReferred, true), [], 0.3)
      .call(() => animateValue(creditsEarnedEl, referralData.creditsEarned, true), [], 0.5);
  }, []);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = referralData.referredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(referralData.referredUsers.length / usersPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

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
    )}&title=Join%20me%20on%20ResearchHub&summary=${encodeURIComponent(text)}&source=ResearchHub`;
    window.open(url, '_blank');
  };

  const shareOnBlueSky = () => {
    const text = `Join me on ResearchHub and let's accelerate science together! We both get a 10% bonus on funding when you join with my link: ${referralLink}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('BlueSky post content copied to clipboard!');
      window.open('https://bsky.app', '_blank');
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-12">
        <div className="flex justify-center items-center mb-4 ">
          <UserPlus className="h-10 w-10 mr-4" />
          <h1 className="text-4xl font-bold text-gray-900">Refer a Funder, Accelerate Science</h1>
        </div>
        <p className="mt-4 text-lg text-gray-600">
          Earn credits by inviting funders to ResearchHub.
        </p>
      </header>

      <main>
        <section className="bg-white rounded-lg shadow-md flex items-stretch overflow-hidden mb-12 border-4 border-blue-500">
          <div className="flex-grow p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4">Your Referral Link</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleCopy} variant="default" className="w-full">
                  <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} className="mr-2" />
                  {isCopied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  onClick={() => setIsQrModalOpen(true)}
                  variant="outlined"
                  className="w-full"
                  aria-label="Show QR Code"
                >
                  <FontAwesomeIcon icon={faQrcode} className="mr-2" />
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

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Referral Impact</h2>
          <div className="bg-green-50 p-6 rounded-xl text-center mb-6">
            <p ref={creditsEarnedRef} className="text-4xl font-bold text-green-600">
              $0
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
                0
              </p>
              <p className="text-gray-600 mt-2">Users Referred</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <FlaskConical className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p ref={amountFundedRef} className="text-3xl font-bold text-blue-600">
                $0
              </p>
              <p className="text-gray-600 mt-2">Funded by Your Referrals</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Referred Users</h2>
          <div className="divide-y divide-gray-100">
            {currentUsers.map((user, index) => (
              <div key={index} className="flex items-center py-4">
                <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full mr-4" />
                <div className="flex-grow">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500">Joined: {user.dateJoined}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Funded</p>
                  <p className="font-semibold text-green-600">
                    ${user.totalFunded.toLocaleString()}
                  </p>
                </div>
                <div className="text-right ml-6">
                  <p className="text-sm text-gray-600">Credits Earned</p>
                  <p className="font-semibold text-blue-600">
                    ${user.creditsEarned.toLocaleString()}
                  </p>
                </div>
                {user.pendingCredits && user.pendingCredits > 0 && (
                  <div className="text-right ml-6">
                    <Tooltip
                      content="Credits will be given once the proposal is fully funded."
                      position="top"
                    >
                      <div>
                        <p className="text-sm text-gray-500 flex items-center justify-end">
                          Pending
                          <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                        </p>
                        <p className="font-semibold text-gray-500">
                          ${user.pendingCredits.toLocaleString()}
                        </p>
                      </div>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outlined"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outlined"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">How It Works</h2>
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
