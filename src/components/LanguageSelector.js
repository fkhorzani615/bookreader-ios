import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, getSupportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const supportedLanguages = getSupportedLanguages();
  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="language-selector">
      <button 
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <Globe size={16} />
        <span className="language-flag">{currentLang?.flag}</span>
        <span className="language-name">{currentLang?.name}</span>
        <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 