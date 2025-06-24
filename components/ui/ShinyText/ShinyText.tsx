import './ShinyText.css';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  onAnimationComplete?: () => void;
  animationDelay?: number; // Delay before calling onAnimationComplete
  wordAnimationDuration?: number; // Duration for word fade-in animation
  wordStaggerDelay?: number; // Delay between each word animation
  shineAnimationDuration?: number; // Duration for the shine effect
}

export default function ShinyText({
  text,
  className = '',
  speed = 1,
  onAnimationComplete,
  animationDelay = 600,
  wordAnimationDuration = 0.3,
  wordStaggerDelay = 0.03,
  shineAnimationDuration = 1,
}: ShinyTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);
  const [isReady, setIsReady] = useState(false);

  // Split text into words with spans
  const renderWords = () => {
    return text.split(' ').map((word, index) => (
      <span
        key={index}
        className="word inline-block mx-0.5"
        style={{ opacity: isReady ? undefined : 0 }}
      >
        {word}
      </span>
    ));
  };

  useEffect(() => {
    // Small delay to ensure component is fully rendered before animation starts
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    if (!textRef.current || hasAnimatedRef.current || !isReady) return;

    // Mark as animated to prevent re-animation on re-renders
    hasAnimatedRef.current = true;

    // Create the shiny effect with GSAP
    const textElement = textRef.current;

    // Add a pseudo-element for the shine effect
    const style = document.createElement('style');
    const uniqueId = `shiny-${Math.random().toString(36).substr(2, 9)}`;
    textElement.classList.add(uniqueId);

    style.innerHTML = `
      .${uniqueId} {
        position: relative;
        overflow: hidden;
      }
      .${uniqueId}::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.3) 50%,
          rgba(255,255,255,0) 100%
        );
        transform: skewX(-25deg);
        z-index: 1;
      }
    `;

    document.head.appendChild(style);

    // Trigger onAnimationComplete after specified delay
    if (onAnimationComplete) {
      setTimeout(onAnimationComplete, animationDelay);
    }

    // Adjust animation speeds based on speed prop
    const scaledWordDuration = wordAnimationDuration / speed;
    const scaledStaggerDelay = wordStaggerDelay / speed;
    const scaledShineDuration = shineAnimationDuration / speed;

    // Animate the words with a staggered fade in
    const wordSpans = textElement.querySelectorAll('.word');

    gsap.fromTo(
      wordSpans,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: scaledWordDuration,
        stagger: scaledStaggerDelay,
        ease: 'power2.out',
        onComplete: () => {
          // After words appear, animate the shine effect
          animateShine();
        },
      }
    );

    // Function to animate the shine effect
    const animateShine = () => {
      gsap.to(`.${uniqueId}::before`, {
        left: '150%',
        duration: scaledShineDuration,
        ease: 'power2.inOut',
      });
    };

    return () => {
      // Cleanup
      document.head.removeChild(style);
    };
  }, [
    text,
    onAnimationComplete,
    speed,
    animationDelay,
    wordAnimationDuration,
    wordStaggerDelay,
    shineAnimationDuration,
    isReady,
  ]);

  return (
    <div ref={textRef} className={`shiny-text ${className}`}>
      {renderWords()}
    </div>
  );
}
