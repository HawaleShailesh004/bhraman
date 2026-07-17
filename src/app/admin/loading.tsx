export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div>
        <div className="h-3 w-28 rounded skeleton-shimmer" />
        <div className="mt-3 h-10 w-56 rounded skeleton-shimmer" />
        <div className="mt-3 h-4 w-80 max-w-full rounded skeleton-shimmer" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-md border border-line bg-white p-4">
          <div className="h-3 w-24 rounded skeleton-shimmer" />
          <div className="mt-4 h-8 w-16 rounded skeleton-shimmer" />
        </div>
        <div className="h-24 rounded-md border border-line bg-white p-4">
          <div className="h-3 w-24 rounded skeleton-shimmer" />
          <div className="mt-4 h-8 w-16 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-48 rounded-md border border-line bg-white p-5"
          >
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="mt-4 h-20 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
