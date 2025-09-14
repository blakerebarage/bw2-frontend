import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = ({ className = '', variant = 'default' }) => {
  const { currentLanguage, availableLanguages, changeLanguage, t } = useLanguage();
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
          button: 'flex items-center gap-2 px-3 py-2 text-white hover:text-yellow-400 transition-colors duration-200 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20',
          dropdown: 'absolute right-0 top-full mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-lg shadow-2xl z-[999995] min-w-[180px] overflow-hidden',
          item: 'flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer border-b border-gray-700/50 last:border-b-0',
        };
      case 'sidebar':
        return {
          button: 'flex items-center gap-2 px-3 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm hover:bg-white transition-colors duration-200 w-full justify-center',
          dropdown: 'absolute bottom-full mb-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 min-w-[200px] left-1/2 transform -translate-x-1/2',
          item: 'flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer border-b border-gray-200 last:border-b-0',
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
                className={`${styles.item} ${
                  currentLanguage === code 
                    ? variant === 'navbar' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : variant === 'sidebar'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-yellow-50 text-yellow-600' 
                    : ''
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{language.name}</span>
                  <span className="text-xs opacity-75">{language.englishName}</span>
                </div>
                {currentLanguage === code && (
                  <div className={`ml-auto w-2 h-2 rounded-full ${
                    variant === 'navbar' ? 'bg-yellow-400' : 'bg-yellow-500'
                  }`}></div>
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