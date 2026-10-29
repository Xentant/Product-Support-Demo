import { useEffect, useState } from 'react';

// Hash routing keeps the static build working on GitHub Pages without server rewrites.
export function useHashRoute(): string[] {
  const read = () => (window.location.hash.replace(/^#\/?/, '') || 'overview').split('/').filter(Boolean);
  const [parts, setParts] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setParts(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parts;
}

export function go(route: string) {
  window.location.hash = route.startsWith('#') ? route : `#${route}`;
}
