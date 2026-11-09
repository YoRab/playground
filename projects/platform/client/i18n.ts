import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import type { ErrorI18n } from '../model'
import platformEn from './locales/en'
import platformFr from './locales/fr'

/** The languages of the interface, each named in itself (language menu) */
export const LANGUAGES = { en: 'English', fr: 'Français' } as const
export type Language = keyof typeof LANGUAGES
const LANGUAGE_CODES = Object.keys(LANGUAGES) as Language[]

/** A dictionary: a text per key, nested objects group the keys (`t('lobby.title')`) */
export type Messages = { [key: string]: string | Messages }

/**
 * The translation of a dictionary (the English one, the reference): the same keys, no more, no less, so that the build
 * fails when a translation misses a text. Plural keys (`_one`, `_other`) are the same in English and in French.
 *
 * @example const fr: TranslationOf<typeof en> = { … }
 */
export type TranslationOf<T> = { [K in keyof T]: T[K] extends string ? string : TranslationOf<T[K]> }

/**
 * The dictionaries by namespace, which types the keys given to `t()`. Each namespace is declared next to its English
 * dictionary, by module augmentation: `host` in the front, `<type>` in each app (the namespace of an app is its type).
 *
 * @example declare module '@platform/client/i18n' { interface Namespaces { notes: typeof en } }
 */
export interface Namespaces {
  platform: typeof platformEn
}

declare module 'i18next' {
  interface ResourceNamespaceMap extends Namespaces {}
}

const STORAGE_KEY = 'language'

const isLanguage = (value: unknown): value is Language => typeof value === 'string' && Object.hasOwn(LANGUAGES, value)

/** The language chosen in the menu, else the first of the browser's languages that the interface speaks, else English */
const detectLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {}
  for (const tag of navigator.languages ?? [navigator.language]) {
    const language = tag.split('-')[0]
    if (isLanguage(language)) return language
  }
  return 'en'
}

/**
 * Starts i18next with the dictionaries of every namespace (`{ host: { en, fr }, chess: { en, fr }, … }`), platform's
 * included. Synchronous: the dictionaries are bundled, so the texts are there before the first render.
 */
export const initI18n = (namespaces: Record<string, Record<Language, Messages>>) => {
  const all: Record<string, Record<Language, Messages>> = { platform: { en: platformEn, fr: platformFr }, ...namespaces }
  const resources = Object.fromEntries(
    LANGUAGE_CODES.map(language => [
      language,
      Object.fromEntries(Object.entries(all).map(([namespace, messages]) => [namespace, messages[language]]))
    ])
  )
  // also run by the init: <html lang> follows the language (screen readers, hyphenation)
  i18n.on('languageChanged', language => {
    document.documentElement.lang = language
  })
  i18n.use(initReactI18next).init({
    resources,
    lng: detectLanguage(),
    supportedLngs: LANGUAGE_CODES,
    fallbackLng: 'en',
    ns: Object.keys(all),
    // no default namespace: every `useTranslation()` names its own
    defaultNS: false,
    // React escapes the values already
    interpolation: { escapeValue: false },
    initAsync: false
  })
}

/**
 * The language of the interface, for the component to follow it (it re-renders when it changes): `Intl` formats, or the
 * texts a library takes in its own format (the `locale` option of react-paint in the Paint app)
 */
export const useLanguage = (): Language => {
  const { i18n } = useTranslation('platform')
  return isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en'
}

/** Changes the language of the interface, remembered by this browser */
export const setLanguage = (language: Language) => {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {}
  return i18n.changeLanguage(language)
}

/** What the client receives of a failed tRPC call: the `i18n` of the data is set by an `i18nError` of the server */
export type ServerError = { message: string; data?: { i18n?: ErrorI18n | null } | null | undefined }

// the keys sent by the server are not known at build time (checked by `i18n.exists` instead)
const translate = (key: string, params: ErrorI18n['params']) => (i18n.t as (key: string, options?: object) => string).call(i18n, key, params)

/** The message of a server error in the language of the interface; the server's (English) message when it has no translation */
export const errorMessage = (error: ServerError) => {
  const i18nError = error.data?.i18n
  return i18nError && i18n.exists(i18nError.key) ? translate(i18nError.key, i18nError.params) : error.message
}

export { Trans } from 'react-i18next'
export { i18n, useTranslation }
