import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ar from '@/locales/ar.json'
import en from '@/locales/en.json'

const DEFAULT_LANG =
  (import.meta.env.VITE_DEFAULT_LANG as string | undefined) ?? 'ar'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANG,
    supportedLngs: ['ar', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'albasheer-lang',
      caches: ['localStorage'],
    },
  })

export default i18n
