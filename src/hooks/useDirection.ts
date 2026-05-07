import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Sync `<html dir>` and `<html lang>` with the active i18n language.
 * Mount once near the root of the app.
 */
export function useDirectionSync() {
  const { i18n } = useTranslation()
  useEffect(() => {
    const lang = i18n.language || 'ar'
    const dir = lang.startsWith('ar') ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [i18n.language])
}
