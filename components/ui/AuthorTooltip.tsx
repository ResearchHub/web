'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AuthorService } from '@/services/author.service';
import { Avatar } from '@/components/ui/Avatar';
import { User } from '@/types/user';
import { cn } from '@/utils/styles';
import { InfoIcon } from 'lucide-react';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface AuthorTooltipProps {
  authorId?: number;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showDelay?: number; // Delay in ms before showing the tooltip
}

// Create a custom tooltip wrapper that uses a portal
const CustomTooltipWrapper: React.FC<{
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  position: 'top' | 'bottom' | 'left' | 'right';
  anchorRef: React.RefObject<HTMLDivElement>;
}> = ({ isVisible, children, className, onMouseEnter, onMouseLeave, position, anchorRef }) => {
  const [mounted, setMounted] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);

    // Update tooltip position based on its anchor element
    if (isVisible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const tooltipWidth = 288; // w-72 = 18rem = 288px

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - 8; // minus a small gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8; // plus a small gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - tooltipWidth - 8;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 8;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position, anchorRef]);

  if (!mounted || !isVisible) return null;

  const positionStyles = {
    position: 'fixed',
    top: `${tooltipPosition.top}px`,
    left: `${tooltipPosition.left}px`,
    zIndex: 9999,
    transform:
      position === 'top'
        ? 'translateY(-100%)'
        : position === 'left' || position === 'right'
          ? 'translateY(-50%)'
          : 'none',
  };

  return createPortal(
    <div
      className={cn('w-72 shadow-lg rounded-md bg-white border border-gray-200', className)}
      style={positionStyles as React.CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>,
    document.body
  );
};

export const AuthorTooltip: React.FC<AuthorTooltipProps> = ({
  authorId,
  children,
  placement = 'bottom',
  className,
  showDelay = 500, // Default delay of 500ms
}) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasTriedFetching = useRef(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a custom tooltip wrapper with a ref we can use
  const tooltipWrapperRef = useRef<HTMLDivElement>(null);
  const tooltipContentRef = useRef<HTMLDivElement>(null);

  // Clear cache once on component initialization
  useEffect(() => {
    // Call clearCache once to ensure we're getting fresh data
    AuthorService.clearCache();
  }, []);

  const fetchAuthorData = async () => {
    if (!authorId || loading || hasTriedFetching.current) return;

    try {
      setLoading(true);
      setHasError(false);
      hasTriedFetching.current = true;
      const user = await AuthorService.getAuthorInfo(authorId);

      if (!user || !user.authorProfile) {
        console.error('AuthorTooltip: Invalid user data received:', user);
        setHasError(true);
      } else {
        setUserData(user);
      }
    } catch (error) {
      console.error('AuthorTooltip: Error fetching author data:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset fetch state when authorId changes
  useEffect(() => {
    if (authorId) {
      hasTriedFetching.current = false;
      setUserData(null);
      setHasError(false);
    }
  }, [authorId]);

  // Handle mouse events for the tooltip
  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    // Add delay before showing the tooltip
    showTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(true);

      if (!hasTriedFetching.current && authorId) {
        fetchAuthorData();
      }
    }, showDelay);
  };

  const handleMouseLeave = () => {
    // Clear show timeout if it exists
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 300); // Delay closing to allow moving to tooltip content
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  // Render tooltip content based on loading state and data
  const tooltipContent = useMemo(() => {
    if (!authorId) return null;

    if (loading) {
      return (
        <div className="p-2 text-center">
          <div className="animate-pulse">Loading author profile...</div>
        </div>
      );
    }

    if (hasError) {
      return <div className="p-2 text-center text-red-500">Could not load author profile</div>;
    }

    if (!userData || !userData.authorProfile) {
      // If not loading and no data yet, we're about to fetch
      // Show a placeholder while waiting for the hover event to trigger fetch
      return (
        <div className="p-2 text-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar and name section */}
          <Avatar
            src={userData.authorProfile.profileImage || ''}
            alt={userData.fullName}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <a
                href={userData.authorProfile.profileUrl}
                className="font-semibold text-gray-900 hover:text-indigo-600 block truncate"
              >
                {userData.fullName}
              </a>
            </div>

            {!userData.authorProfile.isClaimed && (
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <InfoIcon className="mr-1 h-3 w-3" />
                This profile is unclaimed
              </div>
            )}

            {userData.authorProfile.headline && (
              <div className="text-sm text-gray-700 font-medium mt-0.5">
                {userData.authorProfile.headline}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {userData.authorProfile.description && (
          <div className="mt-3 text-sm text-gray-600 line-clamp-3 text-left">
            {userData.authorProfile.description}
          </div>
        )}

        {/* Education */}
        {userData.authorProfile.education && userData.authorProfile.education.length > 0 && (
          <div className="mt-3 text-left">
            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Education</div>
            <ul className="space-y-1">
              {userData.authorProfile.education.map((edu) => (
                <li key={edu.id} className="text-sm text-gray-700">
                  {edu.summary || `${edu.degree.label} in ${edu.major}, ${edu.name}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profile link positioned right above the border */}
        <div className="mt-3 text-left">
          <a
            href="#"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-block"
            onClick={(e) => {
              e.preventDefault();
              navigateToAuthorProfile(userData.authorProfile?.id || userData.id);
            }}
          >
            View profile
          </a>
        </div>

        {/* Social links */}
        <div className="mt-3 flex items-center justify-center border-t pt-3">
          <SocialIcon
            href={userData.authorProfile.twitter}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            }
            label="Twitter"
          />
          <SocialIcon
            href={userData.authorProfile.linkedin}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            }
            label="LinkedIn"
          />
          <SocialIcon
            href={userData.authorProfile.facebook}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            }
            label="Facebook"
          />
          <SocialIcon
            href={userData.authorProfile.googleScholar}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
              </svg>
            }
            label="Google Scholar"
          />
          <SocialIcon
            href={userData.authorProfile.orcidId}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                {/* ORCID icon with its official color */}
                <path
                  fill="#A6CE39"
                  d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm4.163 0h3.909c3.947 0 5.894 2.788 5.894 5.022 0 2.628-2.009 5.022-5.897 5.022h-3.906V7.416zm1.444 1.368v7.303h2.463c3.103 0 4.453-1.641 4.453-3.652 0-1.838-1.2-3.653-4.453-3.653h-2.463v.002z"
                />
              </svg>
            }
            label="ORCID"
          />
        </div>
      </div>
    );
  }, [authorId, userData, loading, hasError]);

  // If no authorId, just render children
  if (!authorId) {
    return <>{children}</>;
  }

  // Use our custom tooltip implementation with portal
  return (
    <div
      ref={tooltipWrapperRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <CustomTooltipWrapper
        isVisible={isTooltipVisible}
        className={className}
        position={placement}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        anchorRef={tooltipWrapperRef}
      >
        <div ref={tooltipContentRef}>{tooltipContent}</div>
      </CustomTooltipWrapper>
    </div>
  );
};
