'use client';

interface MobileOverlayProps {
  show: boolean;
  visible: boolean;
  onClose: () => void;
}

export function MobileOverlay({ show, visible, onClose }: MobileOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black ${
        visible ? 'opacity-50' : 'opacity-0'
      } z-40 tablet:!hidden transition-opacity duration-300 ease-in-out`}
      onClick={onClose}
    />
  );
}
