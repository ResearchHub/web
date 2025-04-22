'use client';

import React, { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JournalHero } from './about/JournalHero';
import { JournalFeatures } from './about/JournalFeatures';
import { JournalEditorialBoard } from './about/JournalEditorialBoard';
import { JournalHowItWorks } from './about/JournalHowItWorks';

// --- Main Component ---
export const JournalAboutTab: FC = () => {
  const router = useRouter();

  const [openHowItWorksId, setOpenHowItWorksId] = useState<string | null>(null);

  const handleHowItWorksToggle = (id: string) => {
    setOpenHowItWorksId(openHowItWorksId === id ? null : id);
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmitNow = () => {
    router.push('/paper/create');
  };

  return (
    <div className="w-full">
      <JournalHero onSubmitNow={handleSubmitNow} onLearnMore={scrollToHowItWorks} />
      <JournalFeatures />
      <JournalEditorialBoard />
      <JournalHowItWorks openItemId={openHowItWorksId} onToggleItem={handleHowItWorksToggle} />
    </div>
  );
};
