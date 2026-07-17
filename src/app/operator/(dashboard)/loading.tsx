export default function OperatorDashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div>
        <div className="h-8 w-56 rounded skeleton-shimmer" />
        <div className="mt-2 h-4 w-72 rounded skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-md border border-line bg-white p-4"
          >
            <div className="h-3 w-20 rounded skeleton-shimmer" />
            <div className="mt-4 h-8 w-24 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
      <div className="h-72 rounded-md border border-line bg-white p-4">
        <div className="h-4 w-40 rounded skeleton-shimmer" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 rounded skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
