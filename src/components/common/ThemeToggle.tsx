import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Primary Toggle Action Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
          theme === 'dark'
            ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
        title={theme === 'dark' ? 'Click Sun to switch to Light Mode' : 'Click Moon to switch to Dark Mode'}
        aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="h-4 w-4 text-amber-400 fill-amber-400/30" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-teal-600 fill-teal-600/30" />
            <span>Dark Mode</span>
          </>
        )}
      </button>

      {/* Sun and Moon direct clickable buttons */}
      <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setTheme('light')}
          title="☀️ Sun (Switch to Light Mode)"
          aria-label="Light Mode"
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-amber-600 shadow-xs ring-1 ring-slate-200 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-400/40' : 'text-slate-400'}`} />
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          title="🌙 Moon (Switch to Dark Mode)"
          aria-label="Dark Mode"
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-900 text-teal-300 shadow-xs ring-1 ring-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-teal-300 fill-teal-400/40' : 'text-slate-400'}`} />
        </button>
      </div>
    </div>
  );
};
