'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface FloatingCat {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  emoji: string;
}

interface FloatingCatsProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

const CAT_EMOJIS = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐱'];

export const FloatingCats = ({ isActive, onComplete, duration = 5000 }: FloatingCatsProps) => {
  const [cats, setCats] = useState<FloatingCat[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive || !mounted) return;

    // Generate random cats
    const newCats: FloatingCat[] = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 100, // Start below viewport
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
      emoji: CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)],
    }));

    setCats(newCats);

    // Clear cats after duration
    const timeout = setTimeout(() => {
      setCats([]);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timeout);
      setCats([]);
    };
  }, [isActive, duration, onComplete, mounted]);

  if (!mounted || cats.length === 0) return null;

  return createPortal(
    <>
      <style>
        {`
          @keyframes floatUpCats {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-${window.innerHeight + 200}px);
              opacity: 0;
            }
          }

          @keyframes wiggleCats {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-20px);
            }
            75% {
              transform: translateX(20px);
            }
          }

          .floating-cat {
            animation: floatUpCats ${duration}ms ease-out forwards;
          }

          .floating-cat-inner {
            animation: wiggleCats 2s ease-in-out infinite;
          }
        `}
      </style>
      <div className="fixed inset-0 pointer-events-none z-50">
        {cats.map((cat) => (
          <div
            key={cat.id}
            className="absolute floating-cat"
            style={{
              left: `${cat.x}px`,
              top: `${cat.y}px`,
            }}
          >
            <div
              className="floating-cat-inner"
              style={{
                transform: `rotate(${cat.rotation}deg) scale(${cat.scale})`,
                fontSize: '3rem',
                display: 'inline-block',
              }}
            >
              {cat.emoji}
            </div>
          </div>
        ))}
      </div>
    </>,
    document.body
  );
};
