'use client';

import { useEffect, useState } from 'react';

interface University {
  name: string;
  logo: string;
  alt: string;
}

const universities: University[] = [
  {
    name: 'Harvard University',
    logo: '/universities/harvard-university.png',
    alt: 'Harvard University',
  },
  {
    name: 'Cornell University',
    logo: '/universities/cornell-university.svg',
    alt: 'Cornell University',
  },
  {
    name: 'UC Irvine',
    logo: '/universities/uc-irvine.svg',
    alt: 'UC Irvine',
  },
  {
    name: 'Iowa State University',
    logo: '/universities/iowa-state-university.svg',
    alt: 'Iowa State University',
  },
  {
    name: 'UC San Diego',
    logo: '/universities/uc-san-diego.svg',
    alt: 'UC San Diego',
  },
  {
    name: 'UC Santa Barbara',
    logo: '/universities/uc-santa-barbara.svg',
    alt: 'University of California Santa Barbara',
  },
  {
    name: 'Indiana University',
    logo: '/universities/indiana-university.svg',
    alt: 'Indiana University',
  },
  {
    name: 'Purdue University',
    logo: '/universities/purdue-university.svg',
    alt: 'Purdue University',
  },
  {
    name: 'University of Maryland',
    logo: '/universities/university-of-maryland-som.svg',
    alt: 'University of Maryland School of Medicine',
  },
  {
    name: 'Stanford University',
    logo: '/universities/stanford-university.png',
    alt: 'Stanford University',
  },
];

function UniversityLogo({ university, delay = 0 }: { university: University; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center justify-center h-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}
    >
      <img
        src={university.logo}
        alt={university.alt}
        className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
        style={{
          width: '160px',
          height: '50px',
          filter: 'brightness(0) invert(0.9)',
        }}
      />
    </div>
  );
}

export function InstitutionsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#3971FF] via-blue-600 to-[#3971FF] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Cal Sans, sans-serif' }}
          >
            Trusted by{' '}
            <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              world class researchers
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Researchers from leading universities and research institutions worldwide trust
            ResearchHub to accelerate their scientific discoveries and funding.
          </p>
        </div>

        {/* University Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-4 md:gap-y-8 lg:gap-12 items-center">
          {universities.map((university, index) => (
            <UniversityLogo key={university.name} university={university} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
