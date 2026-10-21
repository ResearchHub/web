import { BaseScreenProps } from '../types';
import { Button } from '@/components/ui/Button';
import { AuthScreenHeader } from './AuthScreenHeader';

export default function VerifyEmail({ email, onClose }: BaseScreenProps) {
  return (
    <div>
      <AuthScreenHeader
        title="Check your email"
        subtitle={
          <>
            We sent a verification link to <strong className="text-gray-900">{email}</strong>
          </>
        }
      />

      <p className="text-sm text-gray-500 mb-8">
        Click the link in the email to verify your account. If you don't see it, check your spam
        folder.
      </p>

      <Button onClick={onClose} variant="outlined" size="lg" className="w-full">
        Close
      </Button>
    </div>
  );
}
