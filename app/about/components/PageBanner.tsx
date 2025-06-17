'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface PageBannerProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

export const PageBanner = ({
  title,
  subtitle,
  backgroundImage = '/about/background.png',
}: PageBannerProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsRevealed(true);
    }, 200);
  }, []);

  return (
    <div className="relative h-[210px] w-full overflow-hidden">
      <Image
        src={backgroundImage}
        alt={`${title} Background`}
        fill
        className="object-cover"
        priority
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
          isRevealed ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h1 className="text-3xl md:!text-5xl font-normal text-white pt-8">{title}</h1>
        <h3 className="text-xl md:!text-3xl font-light text-white text-center max-w-3xl mt-2 leading-relaxed">
          {subtitle}
        </h3>
      </div>
    </div>
  );
};
