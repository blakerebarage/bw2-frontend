import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = ({ className = '', variant = 'default' }) => {
  const { currentLanguage, currentLanguageData, availableLanguages, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  // Different variants for different contexts
  const getVariantStyles = () => {
    switch (variant) {
      case 'navbar':
        return {
          button: 'flex items-center gap-2  py-2 text-white hover:text-yellow-400 transition-colors duration-200',
          dropdown: 'absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[150px]',
          item: 'flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 cursor-pointer',
        };
      default:
        return {
          button: 'flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200',
          dropdown: 'absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 min-w-[180px]',
          item: 'flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.button}
        aria-label={t('selectLanguage')}
      >
        <FaGlobe className="text-lg" />
        
        <FaChevronDown 
          className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className="py-1">
            {Object.entries(availableLanguages).map(([code, language]) => (
              <div
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className={`${styles.item} ${currentLanguage === code ? 'bg-yellow-50 text-yellow-600' : ''}`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  
                  <span className="text-xs opacity-75">{language.englishName}</span>
                </div>
                {currentLanguage === code && (
                  <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 