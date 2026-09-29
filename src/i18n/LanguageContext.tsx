import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, LanguageOption, TranslationDictionary } from './types';
import { en } from './en';
import { hi } from './hi';

const LANGUAGE_KEY = 'healthchain-language';

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  hi,
  mr: en,
  bn: en,
  ta: en,
  te: en,
  gu: en,
  kn: en,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
  isHindi: boolean;
  isEnglish: boolean;
  formatNotificationMessage: (type: string, data?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
  isHindi: false,
  isEnglish: true,
  formatNotificationMessage: () => '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr' || saved === 'bn' || saved === 'ta' || saved === 'te' || saved === 'gu' || saved === 'kn')) {
        return saved as SupportedLanguage;
      }
    } catch (e) {
      console.warn('Failed to read language from localStorage:', e);
    }
    return 'en'; // Strict default is English
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
      document.documentElement.lang = language;
    } catch (e) {
      console.warn('Failed to persist language to localStorage:', e);
    }
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>, fallback?: string): string => {
      const dict = dictionaries[language] || dictionaries.en;
      let text = dict[key] || dictionaries.en[key] || fallback || key;

      if (params) {
        Object.entries(params).forEach(([k, val]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(val));
        });
      }

      return text;
    },
    [language]
  );

  const formatNotificationMessage = useCallback(
    (type: string, data?: Record<string, any>): string => {
      const phc = data?.phc || data?.phcName || data?.facility || 'PHC Node';
      const medicine = data?.medicine || data?.resourceName || 'Medicine';
      const quantity = data?.quantity || data?.units || 0;
      const days = data?.daysRemaining || data?.days || 2;

      switch (type) {
        case 'SUPPLY_REQUEST':
          return t('notifications.tpl.supplyRequest', { phc, medicine, quantity });
        case 'SUPPLY_APPROVED':
          return t('notifications.tpl.supplyApproved', { phc, medicine, quantity });
        case 'SUPPLY_REJECTED':
          return t('notifications.tpl.supplyRejected', { phc, medicine, quantity });
        case 'SUPPLY_FULFILLED':
          return t('notifications.tpl.supplyFulfilled', { phc, medicine, quantity });
        case 'CRITICAL_STOCK':
          return t('notifications.tpl.criticalStock', { phc, medicine, quantity });
        case 'HIGH_STOCK_RISK':
          return t('notifications.tpl.highStockRisk', { phc, medicine, days });
        case 'EMERGENCY':
          return t('notifications.tpl.emergencyAlert', { phc });
        case 'REDISTRIBUTION':
          return t('notifications.tpl.redistribution', { phc, medicine, quantity });
        default:
          return data?.message || data?.title || t('notifications.allClear');
      }
    },
    [t]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isHindi: language === 'hi',
        isEnglish: language === 'en',
        formatNotificationMessage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
export const useLanguage = () => useContext(LanguageContext);
