import { useEffect } from 'react';

/**
 * Sets document title and meta description for the current page.
 * Usage: useSEO({ title: 'Browse Jobs', description: '...' })
 */
export function useSEO({ title, description } = {}) {
  useEffect(() => {
    const base = 'SkillForce';
    document.title = title ? `${title} — ${base}` : base;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}
