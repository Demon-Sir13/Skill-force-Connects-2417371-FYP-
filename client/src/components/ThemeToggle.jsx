import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 ${className}`}
      style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
    >
      <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'}`}>
        <Moon size={15} style={{ color: 'var(--brand-blue)' }} />
      </span>
      <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-0 scale-75 -rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
        <Sun size={15} className="text-amber-500" />
      </span>
    </button>
  );
}
