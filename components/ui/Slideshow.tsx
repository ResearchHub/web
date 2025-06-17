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
  const slideTrackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [slideHeight, setSlideHeight] = useState<number | null>(null);

  // Touch handling state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Calculate and set the maximum height of all slides
  useEffect(() => {
    if (slideTrackRef.current) {
      // Get all slide elements
      const slideElements = slideTrackRef.current.children;
      let maxHeight = 0;

      // Find the tallest slide
      Array.from(slideElements).forEach((slide) => {
        const slideHeight = slide.scrollHeight;
        maxHeight = Math.max(maxHeight, slideHeight);
      });

      // Set a minimum height to ensure proper vertical centering
      setSlideHeight(Math.max(maxHeight, 200));
    }
  }, [children]);

  // Handle slide change with animation flag
  const changeSlide = (index: number) => {
    if (index === currentSlide || isAnimating) return;

    setIsAnimating(true);
    setCurrentSlide(index);

    // Reset animation flag after transition completes
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match this to your CSS transition duration

    return () => clearTimeout(timer);
  };

  const nextSlide = () => {
    const newIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    changeSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    changeSlide(newIndex);
  };

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    setTouchEnd(e.targetTouches[0].clientX);
    const newOffset = touchEnd - touchStart;
    setDragOffset(newOffset);

    // Prevent default scrolling when swiping
    if (Math.abs(newOffset) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const minSwipeDistance = 50;
    const delta = touchEnd - touchStart;

    if (delta < -minSwipeDistance) {
      nextSlide(); // Swipe left
    } else if (delta > minSwipeDistance) {
      prevSlide(); // Swipe right
    }

    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      {/* Slideshow container */}
      <div className="relative w-full overflow-hidden flex items-center justify-center">
        {/* Slide track - container for all slides */}
        <div
          ref={slideTrackRef}
          className="relative flex transition-transform duration-300 ease-out w-full"
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${isDragging ? dragOffset : 0}px))`,
            transitionProperty: isDragging ? 'none' : 'transform',
            minHeight: slideHeight ? `${slideHeight}px` : 'auto',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="min-w-full w-full flex-shrink-0 flex items-center justify-center"
              aria-hidden={currentSlide !== index}
            >
              {slide}
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-gray-200/80 hover:bg-gray-300 text-gray-700 rounded-full md:bg-gray-200/90 md:shadow-sm',
                'focus:outline-none transition-colors z-10',
                isAnimating && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-200/80 hover:bg-gray-300 text-gray-700 rounded-full md:bg-gray-200/90 md:shadow-sm',
                'focus:outline-none transition-colors z-10',
                isAnimating && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots - now outside and below the slideshow */}
      {totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => changeSlide(index)}
              disabled={isAnimating}
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-200 cursor-pointer',
                currentSlide === index ? 'bg-primary-600' : 'bg-gray-300 hover:bg-gray-400',
                isAnimating && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
