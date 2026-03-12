export function Spinner({ size = 'md', className = '' }) {
  const cls = { sm: 'spinner-sm', md: 'spinner-md', lg: 'spinner-lg' }[size] || 'spinner-md';
  return <span className={`${cls} ${className}`} role="status" aria-label="Loading" />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-bg/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue animate-glow-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        <div className="spinner-lg" />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonGrid({ count = 3, className = 'h-44' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} className={className} />
      ))}
    </div>
  );
}
