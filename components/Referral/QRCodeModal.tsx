'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { BaseModal } from '@/components/ui/BaseModal';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
}

export function QRCodeModal({ isOpen, onClose, referralLink }: QRCodeModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Scan QR Code" maxWidth="max-w-sm">
      <div className="text-center">
        <div className="p-4 bg-gray-100 rounded-md inline-block">
          <QRCodeCanvas value={referralLink} size={192} bgColor="#f3f4f6" />
        </div>
        <p className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded break-words">
          {referralLink}
        </p>
      </div>
    </BaseModal>
  );
}
