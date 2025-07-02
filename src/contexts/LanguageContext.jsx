import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, getTranslation } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or use default
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('app-language');
    return savedLanguage && LANGUAGES[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE;
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-language', currentLanguage);
  }, [currentLanguage]);

  // Translation function
  const t = (key) => {
    return getTranslation(key, currentLanguage);
  };

  // Change language function
  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  // Toggle between languages
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'bn' ? 'en' : 'bn';
    changeLanguage(newLanguage);
  };

  const value = {
    currentLanguage,
    currentLanguageData: LANGUAGES[currentLanguage],
    availableLanguages: LANGUAGES,
    changeLanguage,
    toggleLanguage,
    t, // Translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 