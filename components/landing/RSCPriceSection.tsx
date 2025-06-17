'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Button } from '@/components/ui/Button';
import { ExternalLink, HelpCircle } from 'lucide-react';

export function RSCPriceSection() {
  const [currentPrice] = useState(0.43); // This would be fetched from an API in real implementation
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-[#3971FF] via-blue-600 to-[#3971FF] relative overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Cal Sans, sans-serif' }}
          >
            <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              ResearchCoin
            </span>{' '}
            live pricing
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Get ResearchCoin to participate in the decentralized scientific economy
          </p>
        </div>

        {/* Live Price Display */}
        <div className="flex justify-center">
          <SpotlightCard
            className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-2xl"
            spotlightColor="rgba(251, 146, 60, 0.2)"
          >
            <div className="p-4 flex flex-wrap items-start justify-center gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium h-5 flex items-center justify-center space-x-1 z-10">
                  <span>Current value</span>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      Price fetched hourly from 3rd party sources.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      ${currentPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-12 w-px bg-gray-300 self-center hidden md:!block"></div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="hover:shadow-lg flex items-center space-x-2"
                  onClick={() =>
                    window.open(
                      'https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=0xd101dcc414f310268c37eeb4cd376ccfa507f571',
                      '_blank'
                    )
                  }
                >
                  <span>Buy ResearchCoin</span>
                  <ExternalLink className="w-5 h-5" />
                </Button>
                <p className="text-xs text-gray-500 mt-2">Secure & decentralized</p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
