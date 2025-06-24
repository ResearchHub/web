import React, { useRef, useEffect, useState, useId } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register only ScrollTrigger as SplitText is a premium plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Global store to track which animations have run
const animatedElements = new Set<string>();

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  id?: string; // Optional custom ID
}

// Helper function to split text manually
const splitTextContent = (text: string, splitType: 'chars' | 'words' | 'lines') => {
  if (splitType === 'words') {
    return text.split(' ').map((word, i) => (
      <span key={i} className="inline-block" style={{ display: 'inline-block' }}>
        {word}&nbsp;
      </span>
    ));
  } else if (splitType === 'chars') {
    // Convert text to array of characters while preserving spaces
    const characters = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        // Add a non-breaking space with proper styling
        characters.push(
          <span
            key={`space-${i}`}
            className="inline-block"
            style={{ display: 'inline-block', width: '0.25em' }}
          >
            &nbsp;
          </span>
        );
      } else {
        characters.push(
          <span key={`char-${i}`} className="inline-block" style={{ display: 'inline-block' }}>
            {char}
          </span>
        );
      }
    }
    return characters;
  }
  // Default to lines (though this is simplified)
  return text.split('\n').map((line, i) => (
    <span key={i} className="block" style={{ display: 'block' }}>
      {line}
    </span>
  ));
};

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
  id: customId,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const uniqueId = customId || `split-text-${generatedId}`;
  const [isAnimated, setIsAnimated] = useState(animatedElements.has(uniqueId));

  // Render the split text
  const splitContent = splitTextContent(text, splitType);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const el = ref.current;
    if (!el || animatedElements.has(uniqueId)) {
      // If already animated, just set the final state
      if (el && animatedElements.has(uniqueId)) {
        const elements = Array.from(el.children);
        gsap.set(elements, { ...to });
      }
      return;
    }

    // Get all the split elements
    const elements = Array.from(el.children);
    if (!elements.length) return;

    // Set initial state
    gsap.set(elements, { ...from });

    // Create animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: `top ${(1 - threshold) * 100}%`,
        toggleActions: 'play none none none',
        once: true,
      },
      onComplete: () => {
        animatedElements.add(uniqueId);
        setIsAnimated(true);
        onLetterAnimationComplete?.();
      },
    });

    // Animate each element
    tl.to(elements, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true,
    });

    return () => {
      tl.kill();
      if (ScrollTrigger) {
        const triggers = ScrollTrigger.getAll().filter((t) => t.vars.trigger === el);
        triggers.forEach((t) => t.kill());
      }
      gsap.killTweensOf(elements);
    };
  }, [
    uniqueId,
    text,
    delay,
    duration,
    ease,
    splitType,
    from,
    to,
    threshold,
    rootMargin,
    onLetterAnimationComplete,
  ]);

  return (
    <div
      ref={ref}
      data-split-id={uniqueId}
      className={`split-parent overflow-hidden inline-block whitespace-normal ${className}`}
      style={{
        textAlign,
        wordWrap: 'break-word',
      }}
    >
      {splitContent}
    </div>
  );
};

// Force a new instance when key changes
export default React.memo(SplitText, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.text === nextProps.text &&
    prevProps.id === nextProps.id &&
    prevProps.className === nextProps.className
  );
});
