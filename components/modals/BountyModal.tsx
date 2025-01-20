import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBounty: (amount: number) => void;
}

export const BountyModal: React.FC<BountyModalProps> = ({ isOpen, onClose, onAddBounty }) => {
  const [amount, setAmount] = useState<string>('1000');
  const platformFee = Math.floor(Number(amount) * 0.09); // 9% platform fee
  const total = Number(amount) + platformFee;

  const handleSubmit = () => {
    onAddBounty(Number(amount));
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">Add Bounty</Dialog.Title>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am offering</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="0"
                />
                <span className="text-sm font-medium text-gray-700">RSC</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">Platform Fee (9%)</span>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-900">+ {platformFee} RSC</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-base font-medium">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{total}</span>
                  <span className="text-sm font-medium text-gray-700">RSC</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="default" onClick={handleSubmit} className="w-full">
                Add grant
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
