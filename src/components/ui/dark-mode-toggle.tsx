import { useDarkMode } from '@/hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';

/**
 * Toggle button for dark/light mode
 */
export function DarkModeToggle() {
  const [isDark, toggleDarkMode] = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center p-2 rounded hover:bg-muted"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
