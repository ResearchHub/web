'use client';

import React, { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/styles';
import { ChevronRight, X } from 'lucide-react';

export interface CarouselCard {
  content: ReactNode;
  onClick?: () => void;
  onClose?: () => void;
}

interface CarouselProps {
  cards: CarouselCard[];
  cardWidth?: string; // e.g. 'w-[280px]', default 'w-[280px]'
  gap?: string; // e.g. 'gap-4', default 'gap-4'
  className?: string;
  showFadeGradient?: boolean; // right-edge fade hint, default true
  fillContainer?: boolean; // cards stretch to fill container
}

export const Carousel = ({
  cards,
  cardWidth = 'w-[280px]',
  gap = 'gap-4',
  className,
  showFadeGradient = true,
  fillContainer = false,
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, cards.length]);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  if (cards.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Right fade + arrow overlay */}
      {showFadeGradient && canScrollRight && !fillContainer && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent z-10 flex items-center justify-end pr-0.5 cursor-pointer group"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={cn(
          fillContainer ? 'flex' : 'overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0',
          fillContainer ? '' : ''
        )}
      >
        <div className={cn('flex', gap, fillContainer ? 'w-full' : 'min-w-max pr-8')}>
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className={cn(
                'relative bg-gray-100 rounded-2xl px-4 py-3.5 hover:bg-gray-200/60 transition-colors',
                card.onClick && 'cursor-pointer',
                fillContainer ? 'flex-1 min-w-0' : `flex-shrink-0 ${cardWidth}`
              )}
            >
              {card.onClose && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    card.onClose?.();
                  }}
                  className="absolute top-2.5 right-2.5 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              {card.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
