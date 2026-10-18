import { Sun, Moon } from 'lucide-react';
import { useStore } from '@/store/StoreContext';

export function ThemeToggle() {
  const { settings, toggleTheme } = useStore();
  const isDark = settings.theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center w-11 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors duration-300"
      aria-label="Tema değiştir"
    >
      <span
        className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-neutral-200 shadow-sm flex items-center justify-center transition-transform duration-300 ${
          isDark ? 'translate-x-5' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon size={12} className="text-neutral-700" />
        ) : (
          <Sun size={12} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}
