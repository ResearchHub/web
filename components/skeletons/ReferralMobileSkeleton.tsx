'use client';

interface ReferralMobileSkeletonProps {
  rowCount?: number;
}

export function ReferralMobileSkeleton({ rowCount = 10 }: ReferralMobileSkeletonProps) {
  // Define the columns that match the mobile data structure
  const mobileColumns = [
    { key: 'referrerUser', label: 'Referrer' },
    { key: 'fullName', label: 'Referred User' },
    { key: 'signupDate', label: 'Signup Date' },
    { key: 'totalFunded', label: 'Total Funded' },
    { key: 'referralBonusEarned', label: 'Credits Earned' },
    { key: 'isReferralBonusExpired', label: 'Status' },
  ];

  return (
    <div className="space-y-4">
      {Array.from({ length: rowCount }).map((_, cardIndex) => (
        <div
          key={cardIndex}
          className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 animate-pulse"
        >
          {mobileColumns.map((column) => (
            <div key={column.key} className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0">
                {column.label}
              </span>
              <span className="text-sm text-gray-900 text-right min-w-0 flex-1 ml-4 truncate w-full flex flex-row-reverse">
                {column.key === 'referrerUser' || column.key === 'fullName' ? (
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex flex-col items-end min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                  </div>
                ) : (
                  <div className="h-4 bg-gray-200 rounded w-24" />
                )}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
