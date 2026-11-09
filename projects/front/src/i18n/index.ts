import { clientAppEntries } from '@front/apps'
import { initI18n } from '@platform/client'
import en from './en'
import fr from './fr'

// imported before the first render (main.tsx): the host's texts, and each app's under the namespace of its type
initI18n({
  host: { en, fr },
  ...Object.fromEntries(clientAppEntries.map(([type, app]) => [type, app.messages]))
})
