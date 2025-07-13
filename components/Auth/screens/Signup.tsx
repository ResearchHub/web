import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { parseFullName } from '@/utils/nameUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';
import { Button } from '@/components/ui/Button';
import { useReferral } from '@/contexts/ReferralContext';
import { ReferralService } from '@/services/referral.service';

interface Props extends BaseScreenProps {
  onBack: () => void;
  onVerify: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  modalView?: boolean;
}

export default function Signup({
  onClose,
  email,
  isLoading,
  setIsLoading,
  error,
  setError,
  onBack,
  onVerify,
  modalView = false,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fullNameInputRef = useAutoFocus<HTMLInputElement>(true);
  const { referralCode, clearReferralCode } = useReferral();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { firstName, lastName } = parseFullName(fullName);
      const registrationData = {
        email,
        password1: password,
        password2: password,
        first_name: firstName,
        last_name: lastName,
        referral_code: referralCode || undefined,
      };

      await AuthService.register(registrationData);
      if (referralCode) {
        clearReferralCode();
      }
      onVerify();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-6">
        {modalView && (
          <Button type="button" onClick={onBack} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
          </Button>
        )}

        <h2 className="text-xl font-semibold mr-6">Create your account</h2>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleSignup}>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name (e.g. John Smith)"
          className="w-full p-3 border rounded mb-4"
          ref={fullNameInputRef}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border rounded pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white p-3 rounded mb-4 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {!modalView && (
        <button onClick={onBack} className="w-full text-gray-600 hover:text-gray-800">
          ← Back
        </button>
      )}
    </div>
  );
}
