'use client';

import CardSwap, { Card } from '@/components/ui/CardSwap';
import { Icon } from '@/components/ui/icons';

interface HeroCardSwapProps {
  className?: string;
}

export function HeroCardSwap({ className = '' }: HeroCardSwapProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center relative pt-16 lg:pt-0 ${className}`}
    >
      {/* Responsive container that maintains aspect ratio */}
      <div
        className="w-full h-full max-w-[800px] max-h-[730px] min-w-[400px] min-h-[365px]"
        style={{
          position: 'relative',
          aspectRatio: '12/10',
        }}
      >
        <CardSwap
          width="100%"
          height="100%"
          cardDistance={30}
          verticalDistance={65}
          delay={15000}
          pauseOnHover={false}
          skewAmount={0}
        >
          <Card customClass="!bg-white !border-gray-200">
            {/* Header Section */}
            <div className="flex items-center space-x-3 px-6 py-4 bg-white border-b border-gray-100">
              <Icon name="earn1" size={20} color="black" />
              <span className="text-xl font-semibold text-black">Earn</span>
            </div>
            {/* Video Section */}
            <div className="p-4 flex-1 bg-gray-50 rounded-b-xl">
              <video
                className="w-full h-full object-cover rounded-xl shadow-lg"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/Earn_1080p.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Card>

          <Card customClass="!bg-white !border-gray-200">
            {/* Header Section */}
            <div className="flex items-center space-x-3 px-6 py-4 bg-white border-b border-gray-100">
              <Icon name="fund" size={20} color="black" />
              <span className="text-xl font-semibold text-black">Fund</span>
            </div>
            {/* Video Section */}
            <div className="p-4 flex-1 bg-gray-50 rounded-b-xl">
              <video
                className="w-full h-full object-cover rounded-xl shadow-lg"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/Fund_1080p.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Card>

          <Card customClass="!bg-white !border-gray-200">
            {/* Header Section */}
            <div className="flex items-center space-x-3 px-6 py-4 bg-white border-b border-gray-100">
              <Icon name="rhJournal2" size={20} color="black" />
              <span className="text-xl font-semibold text-black">Publish</span>
            </div>
            {/* Video Section */}
            <div className="p-4 flex-1 bg-gray-50 rounded-b-xl">
              <video
                className="w-full h-full object-cover rounded-xl shadow-lg"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/Publish_1080p.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Card>
        </CardSwap>
      </div>
    </div>
  );
}
