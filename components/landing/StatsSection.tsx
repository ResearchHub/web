'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface StatItemProps {
  value: string;
  label: string;
  delay?: number;
}

function StatItem({ value, label, delay = 0 }: StatItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg">
        {value}
      </div>
      <div className="text-blue-100 text-lg font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section
      id="economy"
      className="py-20 bg-gradient-to-br from-[#3971FF] via-blue-600 to-[#3971FF] relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 left-20 w-12 h-12 bg-amber-300/20 rounded-full animate-pulse-slow"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-8 h-8 bg-purple-200/30 rounded-full animate-pulse-slow"
          style={{ animationDelay: '2.5s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Cal Sans, sans-serif' }}
          >
            ResearchHub powers the
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              decentralized scientific economy
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of researchers and institutions transforming how science gets funded,
            reviewed, and rewarded.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <StatItem value="$650K" label="awarded in research funding" delay={300} />
          <StatItem value="16" label="experiments funded" delay={100} />
          <StatItem value="$1M" label="earned by peer reviewers" delay={200} />
          <StatItem value="6.7K" label="peer reviews completed" delay={400} />
        </div>
      </div>
    </section>
  );
}
