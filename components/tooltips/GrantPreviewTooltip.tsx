'use client';

import { FC, useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';

export interface GrantPreviewTooltipProps {
  href: string;
  title: string;
  description?: string | null;
  image?: string | null;
  amount: string;
  currency: string;
  numApplicants: number;
  delay?: number;
  children: ReactNode;
}

export const GrantPreviewTooltip: FC<GrantPreviewTooltipProps> = ({
  href,
  title,
  description,
  image,
  amount,
  currency,
  numApplicants,
  delay = 500,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPopupPos({ top: rect.bottom, left: rect.left });
      }
      setIsHovered(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  const formattedAmount =
    currency === 'USD'
      ? `$${Number(amount).toLocaleString()}`
      : `${Number(amount).toLocaleString()} ${currency}`;

  return (
    <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}

      {isHovered &&
        popupPos &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="fixed z-[10000] w-[360px]"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            {/* Invisible bridge to cover the gap between trigger and card */}
            <div className="h-[10px]" />
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              <div className="relative w-full h-[72px] bg-gradient-to-br from-indigo-100 to-indigo-200">
                {image && (
                  <Image src={image} alt={title} fill className="object-cover" sizes="280px" />
                )}
              </div>

              <div className="px-3 py-2.5">
                <Link
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-md text-gray-900 leading-snug hover:underline"
                >
                  {title}
                </Link>

                {description && (
                  <p className="text-[13px] text-gray-800 mt-1 line-clamp-4 leading-relaxed">
                    {description}
                  </p>
                )}

                <div className="flex items-center gap-12 mt-2.5 pt-2.5 border-t border-gray-100">
                  <div>
                    <div className="font-mono text-sm font-bold text-gray-900">
                      {formattedAmount}
                    </div>
                    <div className="text-[11px] text-gray-600">Award</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold font-mono text-gray-900">
                      {numApplicants}
                    </div>
                    <div className="text-[11px] text-gray-600">Applicants</div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
