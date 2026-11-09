import type { TranslationOf } from '../i18n'
import type en from './en'

const fr: TranslationOf<typeof en> = {
  loading: 'Chargement…',
  you: '{{name}} (vous)',
  boardUnavailable: 'Tableau indisponible',
  presence: {
    alone: "Personne d'autre sur ce tableau",
    others_one: '{{count}} autre personne sur ce tableau',
    others_other: '{{count}} autres personnes sur ce tableau',
    offline: 'Hors ligne : vos modifications seront envoyées au retour de la connexion'
  },
  errors: {
    unauthorized: 'Connexion requise',
    noAccess: "Vous n'avez pas accès à ce salon",
    notFound: "Ceci n'existe plus",
    boardNotFound: "Ce tableau n'existe pas (ou plus)",
    invalidUpdate: "Cette modification n'a pas pu être appliquée"
  }
}

export default fr
