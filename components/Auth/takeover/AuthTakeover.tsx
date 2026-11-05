'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/styles';
import { BACKDROP_IDS, type BackdropId } from './backdropShaders';
import { ShaderBackdrop } from './ShaderBackdrop';

const HEADLINE = 'The fastest way to fund science.';
const PITCH = 'Researchers post proposals. Anyone can fund them and follow every update.';

const randomBackdrop = (): BackdropId =>
  BACKDROP_IDS[Math.floor(Math.random() * BACKDROP_IDS.length)];

interface AuthTakeoverProps {
  children: ReactNode;
  onClose: () => void;
  /** Fixes the backdrop; by default each opening picks one at random. */
  backdrop?: BackdropId;
}

/**
 * Full-screen sign-in: an animated science backdrop with the pitch on the left
 * (a band on top on small screens) and the sign-in form beside it on white.
 * Closes on Escape.
 */
export function AuthTakeover({ children, onClose, backdrop }: AuthTakeoverProps) {
  const [shown] = useState<BackdropId>(() => backdrop ?? randomBackdrop());
  const wide = useMediaQuery('(min-width: 1024px)') === true;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Log in or sign up"
      // Above the phone's bottom tab bar (z-[100]).
      className="fixed inset-0 z-[110] overflow-y-auto bg-white lg:!flex lg:!overflow-hidden"
    >
      {wide ? (
        <div className="relative w-[53%] max-w-[960px] shrink-0">
          <ShaderBackdrop backdrop={shown} layout="panel" className="absolute inset-0" />
          <Logo variant="white" size={28} loading="eager" className="absolute left-10 top-9" />
          <div className="absolute bottom-10 left-10 right-10 max-w-[520px] rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="text-[44px] font-extrabold leading-[1.02] tracking-tight text-gray-900 [text-wrap:balance]">
              {HEADLINE}
            </h2>
            <p className="mt-3.5 text-base leading-relaxed text-gray-700">{PITCH}</p>
          </div>
        </div>
      ) : (
        <div className="relative h-[280px] tablet:!h-[340px]">
          <ShaderBackdrop backdrop={shown} layout="band" className="absolute inset-0" />
          {/* Darkens the bottom of the band so the headline reads over any backdrop. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#02040c]/90 via-[#02040c]/55 to-transparent" />
          <Logo variant="white" size={22} loading="eager" className="absolute left-5 top-5" />
          <h2 className="absolute bottom-6 left-5 right-5 max-w-[320px] text-[26px] font-extrabold leading-[1.08] tracking-tight text-white [text-wrap:balance]">
            {HEADLINE}
          </h2>
        </div>
      )}

      <div className="flex flex-1 flex-col px-6 pb-10 pt-9 lg:!overflow-y-auto lg:!px-12 lg:!py-16">
        <div className="mx-auto w-full max-w-[400px] lg:!my-auto">
          {children}
          <p className="mt-8 text-[13px] leading-relaxed text-gray-500">
            By continuing, you agree to our{' '}
            <Link
              href="/tos"
              className="font-medium text-gray-700 underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-gray-700 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close"
        className={cn(
          'absolute right-3 top-3 lg:!right-6 lg:!top-6',
          !wide && 'text-white hover:bg-white/10 hover:text-white'
        )}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
