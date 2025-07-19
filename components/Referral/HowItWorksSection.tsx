'use client';

import Image from 'next/image';

export function HowItWorksSection() {
  return (
    <section className="bg-white mb-12">
      <h2 className="text-2xl sm:!text-3xl font-bold text-center mb-10 text-gray-800">
        How It Works
      </h2>
      <div className="flex justify-center -mt-[40px]">
        <Image
          src="/referral/how_it_works4.png"
          alt="How referral works"
          width={700}
          height={150}
          className="max-w-full h-auto"
        />
      </div>
    </section>
  );
}
