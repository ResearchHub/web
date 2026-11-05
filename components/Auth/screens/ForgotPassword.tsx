import { useState } from 'react';
import { BaseScreenProps } from '../types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/form/Input';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { usePasswordReset } from '@/hooks/useAuth';
import { AuthScreenHeader } from './AuthScreenHeader';

interface Props extends BaseScreenProps {
  onBack: () => void;
  modalView?: boolean;
}

export default function ForgotPassword({
  email,
  error: authError,
  setError: setAuthError,
  onBack,
}: Props) {
  const [localEmail, setLocalEmail] = useState(email);
  const { resetPassword, isLoading, error, success, reset } = usePasswordReset();
  const emailInputRef = useAutoFocus<HTMLInputElement>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localEmail) {
      setAuthError('Please enter your email address');
      return;
    }

    setAuthError(null);
    await resetPassword(localEmail);
  };

  const handleBack = () => {
    reset();
    setAuthError(null);
    onBack();
  };

  if (success) {
    return (
      <div>
        <AuthScreenHeader title="Request submitted" onBack={handleBack} />

        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          <p className="mb-2">
            We've sent a password reset link to <strong>{localEmail}</strong>
          </p>
          <p className="text-sm">
            Click the link in the email to reset your password. If you don't see it, check your spam
            folder.
          </p>
        </div>

        <Button onClick={handleBack} size="lg" className="w-full mb-4">
          Back to login
        </Button>

        <p className="text-center text-sm text-gray-600">
          Didn't receive the email?{' '}
          <Button
            type="button"
            variant="link"
            onClick={() => {
              reset();
              setAuthError(null);
            }}
          >
            Try again
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <AuthScreenHeader
        title="Reset your password"
        subtitle="We'll email you a link to choose a new one."
        onBack={handleBack}
        backLabel="Back to login"
      />

      {(error || authError) && (
        <Alert variant="error" className="mb-4">
          {error || authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          id="email"
          type="email"
          label="Email"
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          placeholder="name@institution.org"
          autoCapitalize="none"
          autoComplete="email"
          className="h-12"
          wrapperClassName="mb-5"
          ref={emailInputRef}
          data-testid="auth-forgot-email-input"
        />

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full"
          data-testid="auth-forgot-submit"
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </div>
  );
}
