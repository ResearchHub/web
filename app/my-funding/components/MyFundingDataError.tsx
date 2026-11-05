interface MyFundingDataErrorProps {
  readonly message?: string;
}

/** Non-blocking error notice for a dashboard data source. */
export function MyFundingDataError({
  message = 'Data failed to load. Please refresh and try again.',
}: MyFundingDataErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {message}
    </div>
  );
}
