import { useState } from 'react';

const SIZES = {
  xs:  'w-6 h-6 text-[9px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-14 h-14 text-lg',
  xl:  'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
};

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZES[size] || SIZES.md;
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const showFallback = !src || imgError;

  return (
    <div className={`${sizeClass} rounded-xl overflow-hidden shrink-0 ${className}`}>
      {!showFallback ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-indigo))' }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
