'use client';

import { Landmark, Clock, Shield, ExternalLink } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

/**
 * Inline bank account deposit view for use within the contribution modal.
 * Shows "Coming Soon" since ACH is not yet implemented.
 */
export function BankAccountView() {
  return (
    <div className="space-y-5">
      <Alert variant="info">
        <div className="space-y-1">
          <p className="font-medium">ACH Bank Transfer</p>
          <p className="text-sm opacity-90">
            Securely connect your bank account to transfer funds directly to your ResearchHub
            wallet. Transfers typically take 3-5 business days.
          </p>
        </div>
      </Alert>

      {/* Coming Soon Notice */}
      <Alert variant="warning">
        <div className="space-y-1">
          <p className="font-medium">Coming Soon</p>
          <p className="text-sm opacity-90">
            ACH bank transfers are currently being implemented. In the meantime, you can use
            ResearchCoin deposits or wire transfers for larger amounts.
          </p>
        </div>
      </Alert>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Benefits of ACH Transfer</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Direct Bank Connection</p>
              <p className="text-sm text-gray-600">
                Connect your checking or savings account securely
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Bank-Level Security</p>
              <p className="text-sm text-gray-600">256-bit encryption protects your information</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Reasonable Limits</p>
              <p className="text-sm text-gray-600">Transfer up to $10,000 per transaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Link */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Questions about deposits?{' '}
          <a
            href="mailto:support@researchhub.com"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
          >
            Contact support
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
