import { BaseScreenProps } from '../types';

export default function VerifyEmail({ email, onClose }: BaseScreenProps) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-6">Check your email</h2>

      <p className="text-gray-600 mb-6">
        We sent a verification link to <strong>{email}</strong>
      </p>

      <p className="text-sm text-gray-500 mb-8">
        Click the link in the email to verify your account. If you don't see it, check your spam
        folder.
      </p>

      <button
        onClick={onClose}
        className="w-full bg-gray-100 text-gray-600 p-3 rounded hover:bg-gray-200"
      >
        Close
      </button>
    </div>
  );
}
