'use client';

import { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/Button';
import { PartyPopper, Copy } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';

interface ShareModalProps {
  onClose: () => void;
  title?: string;
  url?: string;
}

export default function ShareModal({
  onClose,
  title = 'AI-Powered Drug Discovery',
  url = 'https://researchhub.com/experiment/ai-drug-discovery',
}: ShareModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
      setShowConfetti(true);
      if (modalRef.current) {
        setModalDimensions({
          width: modalRef.current.offsetWidth,
          height: modalRef.current.offsetHeight,
        });
      }
    }, 100);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes modalFadeIn {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes modalFadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this experiment on ResearchHub: ${title}`)}`,
      '_blank'
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnBluesky = () => {
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`Check out this experiment on ResearchHub: ${title} ${url}`)}`,
      '_blank'
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4"
      style={{
        animation: isClosing
          ? 'modalFadeOut 0.3s ease-out forwards'
          : isVisible
            ? 'modalFadeIn 0.3s ease-out forwards'
            : 'none',
        opacity: isVisible ? 1 : 0,
      }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {showConfetti && modalDimensions.width > 0 && (
          <Confetti
            width={modalDimensions.width}
            height={modalDimensions.height}
            gravity={0.2}
            recycle={false}
            numberOfPieces={100}
          />
        )}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none transition-colors duration-200 z-10"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-blue-100">
            <PartyPopper size={36} color="#3B82F6" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">You're a Research Champion!</h2>
          <p className="text-gray-500 mt-2 px-4">
            Thank you for funding <span className="font-semibold text-blue-600">{title}</span>! Your
            support is vital. Help us spread the word.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="share-url" className="text-sm font-medium text-gray-700">
            Share this experiment:
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="share-url"
              id="share-url"
              className="focus:ring-blue-500 focus:border-blue-500 flex-1 rounded-none rounded-l-md text-sm border border-gray-300 bg-gray-50 p-2"
              value={url}
              readOnly
            />
            <button
              onClick={handleCopy}
              className="relative -ml-px inline-flex items-center space-x-2 px-4 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <Copy size={16} />
              <span>Copy</span>
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 text-center">Or share directly on:</p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <Button variant="outlined" className="w-full" onClick={shareOnLinkedIn}>
              <FontAwesomeIcon icon={faLinkedin} size="lg" />
            </Button>
            <Button variant="outlined" className="w-full" onClick={shareOnTwitter}>
              <FontAwesomeIcon icon={faXTwitter} size="lg" />
            </Button>
            <Button variant="outlined" className="w-full" onClick={shareOnBluesky}>
              <FontAwesomeIcon icon={faBluesky} size="lg" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
