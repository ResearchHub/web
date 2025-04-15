'use client';

import React, { useState, Children, ReactNode, FC } from 'react';
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (totalSlides === 0) {
    return null; // Don't render anything if there are no slides
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Container for slide content and side buttons */}
      <div className="relative flex items-center">
        {/* Slide Content Area */}
        <div className="overflow-hidden relative min-h-[200px] flex-grow mx-12">
          {' '}
          {/* Added margin for buttons */}
          {/* Render only the current slide */}
          <div className="transition-opacity duration-300 ease-in-out">{slides[currentSlide]}</div>
        </div>

        {/* External Navigation Arrows (only if more than one slide) */}
        {totalSlides > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              // Positioned absolutely to the left of the content area
              className="absolute left-0 top-1/2 -translate-y-1/2 transform p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full focus:outline-none transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            {/* Next Button */}
            <button
              onClick={nextSlide}
              // Positioned absolutely to the right of the content area
              className="absolute right-0 top-1/2 -translate-y-1/2 transform p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full focus:outline-none transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots (only if more than one slide) - Moved outside flex container */}
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
