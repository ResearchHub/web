'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { Button } from '@/components/ui/Button';
import { Copy, Check, QrCode } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { ReferralLinkSkeleton } from './ReferralLinkSkeleton';
import { QRCodeModal } from './QRCodeModal';

export function ReferralLinkCard() {
  const [isCopied, setIsCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { user: currentUser, isLoading, error } = useUser();

  const referralCode = currentUser?.referralCode;
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://researchhub.com'}/referral/join?refr=${referralCode}`;

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

  // Show skeleton while loading
  if (isLoading) {
    return <ReferralLinkSkeleton />;
  }

  // Don't render if user is not authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <>
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
              <Button onClick={handleCopy} variant="default" className="w-full text-xs lg:!text-sm">
                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
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

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        referralLink={referralLink}
      />
    </>
  );
}
