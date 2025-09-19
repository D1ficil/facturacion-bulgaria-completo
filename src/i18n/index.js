import React, { createContext, useContext, useState, useEffect } from 'react';

// Importar traducciones
import bg from '../translations/bg.json';
import es from '../translations/es.json';  
import en from '../translations/en.json';

const translations = {
  bg,
  es,
  en
};

// Contexto de internacionalización
const I18nContext = createContext();

// Hook para usar traducciones
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation debe usarse dentro de I18nProvider');
  }
  return context;
};

// Provider de internacionalización
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('bg'); // Idioma por defecto

  useEffect(() => {
    // Cargar idioma guardado del localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  // Función de traducción
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key;
    }

    // Reemplazar parámetros {{param}}
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] || match;
    });
  };

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook para formatear fechas según idioma
export const useLocalizedDate = () => {
  const { language } = useTranslation();
  
  const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const locales = {
      bg: 'bg-BG',
      es: 'es-ES', 
      en: 'en-US'
    };
    
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    };
    
    return new Date(date).toLocaleDateString(locales[language] || 'bg-BG', defaultOptions);
  };

  return { formatDate };
};

// Hook para formatear moneda según idioma
export const useLocalizedCurrency = () => {
  const { language } = useTranslation();
  
  const formatCurrency = (amount, currency) => {
    if (typeof amount !== 'number') return '0.00';
    
    const currencyMap = {
      bg: currency || 'BGN',
      es: currency || 'EUR',
      en: currency || 'EUR'
    };
    
    const locales = {
      bg: 'bg-BG',
      es: 'es-ES',
      en: 'en-US'
    };
    
    return new Intl.NumberFormat(locales[language] || 'bg-BG', {
      style: 'currency',
      currency: currencyMap[language],
      minimumFractionDigits: 2
    }).format(amount);
  };

  return { formatCurrency };
};

// Componente selector de idioma
export const LanguageSelector = ({ className = "" }) => {
  const { language, changeLanguage, availableLanguages } = useTranslation();
  
  const languageNames = {
    bg: 'Български',
    es: 'Español', 
    en: 'English'
  };

  return (
    <select 
      value={language} 
      onChange={(e) => changeLanguage(e.target.value)}
      className={`border rounded px-2 py-1 ${className}`}
    >
      {availableLanguages.map(lang => (
        <option key={lang} value={lang}>
          {languageNames[lang] || lang}
        </option>
      ))}
    </select>
  );
};