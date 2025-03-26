'use client';

import { Building, HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { NonprofitDisplay } from './NonprofitDisplay';
import { NonprofitSkeleton } from '@/components/skeletons/NonprofitSkeleton';
import { ID } from '@/types/root';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { useEffect, useState } from 'react';

interface NonprofitSectionProps {
  fundraiseId: ID;
  className?: string;
}

/**
 * Component to display nonprofit information associated with a fundraise
 */
export function NonprofitSection({ fundraiseId, className }: NonprofitSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { nonprofit, departmentLabName, isLoading, fetchNonprofitData } =
    useNonprofitByFundraiseId();

  useEffect(() => {
    fetchNonprofitData(fundraiseId);
    setIsMounted(true);
  }, [fundraiseId, fetchNonprofitData]);

  if (!nonprofit && !isLoading && isMounted) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-center space-x-2 mb-4">
        <Building className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Associated Nonprofit</h2>
        <Tooltip
          content={
            <div className="max-w-xs">
              <p>
                Donations are processed through this nonprofit foundation, making your contributions
                ({'>'} $1000) tax-deductible while supporting the researcher&apos;s work.
              </p>
            </div>
          }
          width="w-80"
        >
          <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      {isLoading || !isMounted ? (
        <NonprofitSkeleton showHeader={false} />
      ) : (
        nonprofit && (
          <NonprofitDisplay
            nonprofit={nonprofit}
            departmentLabName={departmentLabName}
            className="mt-2"
          />
        )
      )}
    </section>
  );
}
