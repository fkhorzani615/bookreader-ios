import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Load language from localStorage or use browser language
    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = navigator.language.split('-')[0];
    const defaultLanguage = savedLanguage || browserLanguage || 'en';
    
    // Check if the language is supported
    const supportedLanguages = Object.keys(translations);
    const language = supportedLanguages.includes(defaultLanguage) ? defaultLanguage : 'en';
    
    setCurrentLanguage(language);
    setT(translations[language]);
    
    // Set document direction for RTL languages
    const rtlLanguages = ['ar', 'fa'];
    document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  }, []);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      setT(translations[language]);
      localStorage.setItem('language', language);
      
      // Set document direction for RTL languages
      const rtlLanguages = ['ar', 'fa'];
      document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    }
  };

  const getSupportedLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    ];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getSupportedLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 