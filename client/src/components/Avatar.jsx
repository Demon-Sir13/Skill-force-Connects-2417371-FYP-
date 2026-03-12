const PLACEHOLDER = (name, size = 200) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=0EA5E9&color=fff&size=${size}`;

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  const imgSrc = src || PLACEHOLDER(name);
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className={`${sizes[size] || sizes.md} rounded-xl overflow-hidden shrink-0 ${className}`}>
      <img
        src={imgSrc}
        alt={name || 'Avatar'}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div
        className="w-full h-full bg-gradient-brand items-center justify-center text-white font-bold hidden"
        style={{ display: 'none' }}
      >
        {initials}
      </div>
    </div>
  );
}
