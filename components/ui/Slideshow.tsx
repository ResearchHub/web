'use client';

import React, { useState, Children, ReactNode, FC, useRef, useEffect, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface SlideshowProps {
  children: ReactNode;
  className?: string;
}

export const Slideshow: FC<SlideshowProps> = ({ children, className }) => {
  const slides = Children.toArray(children);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    // Scroll to the next slide if on mobile
    if (isMobile && slideContainerRef.current) {
      const slideWidth = slideContainerRef.current.scrollWidth / totalSlides;
      const nextSlidePos = slideWidth * ((currentSlide + 1) % totalSlides);
      slideContainerRef.current.scrollTo({ left: nextSlidePos, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    // Scroll to the previous slide if on mobile
    if (isMobile && slideContainerRef.current) {
      const slideWidth = slideContainerRef.current.scrollWidth / totalSlides;
      const prevSlidePos = slideWidth * ((currentSlide - 1 + totalSlides) % totalSlides);
      slideContainerRef.current.scrollTo({ left: prevSlidePos, behavior: 'smooth' });
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    // Scroll to selected slide if on mobile
    if (isMobile && slideContainerRef.current) {
      const slideWidth = slideContainerRef.current.scrollWidth / totalSlides;
      slideContainerRef.current.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    }
  };

  // Handle mobile scroll events to update the current slide
  const handleScroll = () => {
    if (isMobile && slideContainerRef.current) {
      const scrollPos = slideContainerRef.current.scrollLeft;
      const slideWidth = slideContainerRef.current.scrollWidth / totalSlides;
      const newSlideIndex = Math.round(scrollPos / slideWidth);
      if (newSlideIndex !== currentSlide && newSlideIndex >= 0 && newSlideIndex < totalSlides) {
        setCurrentSlide(newSlideIndex);
      }
    }
  };

  // Touch event handlers for swiping
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (totalSlides === 0) {
    return null; // Don't render anything if there are no slides
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Container for slide content and side buttons */}
      <div className="relative flex items-center">
        {/* Left navigation button - positioned outside content area for desktop, but
            positioned absolutely for mobile to avoid shrinking the content */}
        {totalSlides > 1 && !isMobile && (
          <button
            onClick={prevSlide}
            className="flex-none p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full focus:outline-none transition-colors z-10 mr-2"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Slide Content Area */}
        <div className={cn('relative flex-grow overflow-hidden', isMobile ? 'w-full' : 'mx-0')}>
          {isMobile ? (
            // Mobile: Horizontal scrollable container with touch events for swiping
            <div
              ref={slideContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4"
              onScroll={handleScroll}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch', // Better scrolling on iOS
              }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="min-w-full snap-center flex-shrink-0 px-1">
                  {slide}
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Show only current slide
            <div className="transition-opacity duration-300 ease-in-out">
              {slides[currentSlide]}
            </div>
          )}
        </div>

        {/* Right navigation button - positioned outside content area for desktop, but
            positioned absolutely for mobile to avoid shrinking the content */}
        {totalSlides > 1 && !isMobile && (
          <button
            onClick={nextSlide}
            className="flex-none p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full focus:outline-none transition-colors z-10 ml-2"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Mobile navigation buttons - positioned at the edges of the screen */}
      {totalSlides > 1 && isMobile && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 transform p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full focus:outline-none transition-colors z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 transform p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full focus:outline-none transition-colors z-10"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                currentSlide === index ? 'bg-indigo-600' : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
