'use client';

import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuthModalContext } from '@/contexts/AuthModalContext';

export function LandingTopBar() {
  const { showAuthModal } = useAuthModalContext();

  const handleSignUp = () => {
    showAuthModal();
  };

  const handleLogin = () => {
    showAuthModal();
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size={44} />
          </div>

          {/* Sign Up and Log in buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="md"
              onClick={handleLogin}
              className="hidden sm:block text-gray-700 hover:text-gray-900"
            >
              Log in
            </Button>
            <Button
              variant="default"
              size="md"
              onClick={handleSignUp}
              className="bg-[#3971FF] text-white hover:bg-[#2C5EE8]"
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
