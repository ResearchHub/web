import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';

interface NonprofitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nonprofitName: string;
  ein?: string; // Optional EIN
}

export function NonprofitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  nonprofitName,
  ein,
}: NonprofitConfirmModalProps) {
  const nonprofitDisplay = (
    <span className="font-semibold">
      ({nonprofitName}
      {ein ? `, EIN: ${ein}` : ''})
    </span>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nonprofit Funding Confirmation">
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          You&apos;ve selected {nonprofitDisplay} as a supporting nonprofit. Endaoment is providing
          nonprofit support to facilitate the fundraising process and will convert all RSC donations
          to cash at the time of fundraise completion. All funds will be sent from Endaoment
          directly to {nonprofitDisplay} as the supporting nonprofit that you selected. The funds
          will not be sent to your personal custody at fundraise completion. You will need to
          directly coordinate with {nonprofitDisplay} in advance of fundraise completion.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>I Understand</Button>
        </div>
      </div>
    </Modal>
  );
}
