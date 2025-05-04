import { useState, useEffect } from 'react';

/**
 * Hook para gestionar el modo oscuro.
 * Lee la preferencia del usuario de localStorage o del sistema,
 * aplica la clase `dark` al root, y permite alternar el tema.
 */
export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return [isDark, toggleDarkMode];
}
