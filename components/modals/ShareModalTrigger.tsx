'use client';

import { useState } from 'react';
import ShareModal from './ShareModal';
import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/icons/Icon';

export default function ShareModalTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[9998]">
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full !h-14 !w-14">
          <Icon name="socialMedia" size={24} color="white" />
        </Button>
      </div>
      {isModalOpen && <ShareModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
