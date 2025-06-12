'use client';

import CardSwap, { Card } from '@/components/ui/CardSwap';
import { Icon } from '@/components/ui/icons';

interface HeroCardSwapProps {
  className?: string;
}

export function HeroCardSwap({ className = '' }: HeroCardSwapProps) {
  return (
    <div className={`flex justify-center lg:justify-center relative ${className}`}>
      <div
        className="transform translate-x-20 translate-y-40"
        style={{ height: '600px', position: 'relative' }}
      >
        <CardSwap
          width={960}
          height={600}
          cardDistance={50}
          verticalDistance={100}
          delay={5000}
          pauseOnHover={false}
        >
          <Card customClass="!bg-white !border-gray-200">
            {/* Header Section with Clean White Background */}
            <div className="flex items-center space-x-3 px-6 py-4 bg-white border-b border-gray-100">
              <Icon name="earn1" size={20} color="#4f46e5" />
              <span className="text-xl font-semibold text-primary-600">Earn</span>
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
            {/* Header Section with Clean White Background */}
            <div className="flex items-center space-x-3 px-6 py-4 bg-white border-b border-gray-100">
              <Icon name="fund" size={20} color="#4f46e5" />
              <span className="text-xl font-semibold text-primary-600">Fund</span>
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
            {/* Header Section with Clean White Background */}
            <div className="flex items-center space-x-3 px-6 py-4 bg-white border-b border-gray-100">
              <Icon name="rhJournal2" size={20} color="#4f46e5" />
              <span className="text-xl font-semibold text-primary-600">Publish</span>
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
