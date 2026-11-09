import { findClientApp } from '@front/apps'
import { useLanguage } from '@platform/client'

/** The name and the sentence of an app from its type, in the language of the interface; its type for an app this client does not know */
export const useAppTexts = () => {
  const language = useLanguage()
  return (type: string) => findClientApp(type)?.messages[language] ?? { label: type, description: '' }
}
