import { Zap } from 'lucide-react';

export function Spinner({ size = 'md', className = '' }) {
  const cls = { sm: 'spinner-sm', md: 'spinner-md', lg: 'spinner-lg' }[size] || 'spinner-md';
  return <span className={`${cls} ${className}`} role="status" aria-label="Loading" />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(var(--bg), 0.9)', backgroundColor: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-indigo))', boxShadow: 'var(--shadow-glow)' }}>
          <Zap size={22} className="text-white" />
        </div>
        <div className="spinner-lg" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
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

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl skeleton h-14" />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="skeleton w-20 h-20 rounded-2xl" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton h-5 w-48 rounded-lg" />
          <div className="skeleton h-3 w-32 rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-24 rounded-2xl" />
    </div>
  );
}
