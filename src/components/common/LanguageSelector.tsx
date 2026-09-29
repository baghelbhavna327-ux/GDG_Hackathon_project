import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, SupportedLanguage } from '../../i18n';
import { useToast } from '../../context/ToastContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'pill' | 'expanded' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, supportedLanguages, t } = useTranslation();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const currentOption = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const handleSelectLanguage = (code: SupportedLanguage) => {
    if (code !== language) {
      setLanguage(code);
      const selected = supportedLanguages.find((l) => l.code === code);
      showToast({
        type: 'info',
        title: code === 'hi' ? 'भाषा बदलकर हिन्दी की गई' : 'Language switched to English',
        message: `${selected?.flag} ${selected?.nativeName} (${selected?.name})`,
        duration: 2500,
      });
    }
    setIsOpen(false);
  };

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 ${className}`}>
        {supportedLanguages
          .filter((l) => l.available)
          .map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                aria-pressed={isSelected}
                aria-label={`Switch language to ${lang.name}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Selected language: ${currentOption.name}. Click to change language.`}
      >
        <Globe className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="hidden sm:inline font-bold">{currentOption.nativeName}</span>
        <span className="sm:hidden font-bold uppercase">{currentOption.code}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900 dark:text-slate-100"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('common.selectLanguage')}
            </p>
          </div>

          <div className="space-y-0.5">
            {supportedLanguages
              .filter((lang) => lang.available)
              .map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-bold">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                  </button>
                );
              })}
          </div>

          {/* Future Languages Teaser */}
          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 px-2 py-1">
            <p className="text-[9px] text-slate-400 dark:text-slate-500">
              More Indian languages (मराठी, বাংলা, தமிழ், etc.) coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
