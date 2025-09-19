import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import bgTranslations from './translations/bg.json';
import esTranslations from './translations/es.json';
import enTranslations from './translations/en.json';

const resources = {
  bg: {
    translation: bgTranslations
  },
  es: {
    translation: esTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'bg', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;