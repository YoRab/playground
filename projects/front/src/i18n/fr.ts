import type { TranslationOf } from '@platform/client'
import type en from './en'

const fr: TranslationOf<typeof en> = {
  common: {
    unknownUser: 'une personne inconnue'
  },
  toolbar: {
    navigation: 'navigation principale',
    account: 'Compte',
    signedInAs: 'Vous êtes {{name}}',
    logout: 'Se déconnecter',
    language: 'Langue',
    colorScheme: 'Thème'
  },
  colorScheme: {
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Système'
  },
  login: {
    tagline: 'Des mini-apps en temps réel pour jouer et créer ensemble.',
    title: 'Choisissez un pseudo',
    subtitle: 'Pas de compte, pas de mot de passe : un pseudo suffit.',
    nickname: 'Pseudo',
    placeholder: 'ex. Ada',
    tooShort: 'Votre pseudo doit contenir au moins 2 lettres',
    submit: 'Commencer à jouer'
  },
  home: {
    title: 'Salons',
    subtitle: 'Rejoignez un salon, ou ouvrez le vôtre et invitez vos amis.',
    unavailable: 'Salons indisponibles',
    newRoom: 'Nouveau salon',
    createRoom: 'Créer le salon',
    defaultRoomTitle: 'Salon de {{name}}',
    empty: 'Aucun salon pour le moment',
    emptyHint: 'Ouvrez-en un et partagez son lien avec vos amis.',
    deleteTitle: 'Supprimer le salon',
    deleteBody: 'Supprimer <strong>{{title}}</strong> et tous ses tableaux ?'
  },
  roomCard: {
    noBoard: 'Aucun tableau pour le moment',
    delete: 'Supprimer ce salon',
    you: 'Vous',
    unknownOwner: 'Inconnu',
    nobody: 'Personne ici',
    full: 'Complet',
    online: '{{count}} en ligne',
    onlineOf: '{{count}}/{{max}} en ligne',
    join: 'Rejoindre'
  },
  room: {
    allRooms: 'Tous les salons',
    unavailable: 'Salon indisponible',
    settings: 'Paramètres du salon',
    participants: 'Dans le salon / participants max',
    addBoard: 'Ajouter un tableau',
    unknownType: 'Type de tableau inconnu : {{type}}',
    deleteBoardTitle: 'Supprimer le tableau',
    deleteBoardBody: 'Supprimer ce tableau pour tout le monde dans le salon ?',
    kickTitle: 'Exclure',
    kickBody:
      "Exclure <strong>{{name}}</strong> du salon ? Cette personne ne pourra pas revenir tant que vous ne l'aurez pas réadmise depuis les paramètres du salon.",
    kickConfirm: 'Exclure'
  },
  tabs: {
    overview: "Vue d'ensemble",
    deleteBoard: 'Supprimer ce tableau'
  },
  overview: {
    boards: 'Tableaux',
    pickFirst: 'Choisissez une app pour ajouter le premier tableau : tout le salon le verra.',
    waiting: 'En attente que {{name}} ajoute un tableau',
    theOwner: 'le propriétaire',
    open: 'Ouvrir',
    deleteBoard: 'Supprimer {{label}}',
    inTheRoom: 'Dans le salon',
    createdBy: 'Créé par {{name}}',
    createdByYou: 'Créé par vous',
    nobody: "Personne n'est là.",
    owner: 'Propriétaire',
    kick: 'Exclure {{name}}'
  },
  invite: {
    button: 'Inviter',
    title: 'Inviter des personnes',
    protected: 'Partagez ce lien et le mot de passe : il est demandé une seule fois, après le choix du pseudo.',
    public: 'Toute personne qui a ce lien peut rejoindre le salon après avoir choisi un pseudo.',
    link: "Lien d'invitation",
    copy: 'Copier',
    copied: 'Copié'
  },
  settings: {
    name: 'Nom',
    nameRequired: 'Donnez un nom au salon',
    whoCanJoin: 'Qui peut entrer',
    password: 'Mot de passe',
    passwordHint: 'Chaque personne qui entre le tape une seule fois',
    keepPassword: 'Laissez vide pour garder le mot de passe actuel',
    passwordRequired: "Un salon protégé a besoin d'un mot de passe",
    passwordTooShort: 'Au moins {{min}} caractères',
    maxParticipants: 'Participants max',
    participantsRange: 'Entre {{min}} et {{max}}',
    youIncluded: 'Y compris vous',
    privateHint: "Personne d'autre que vous ne peut entrer dans un salon privé",
    save: 'Enregistrer',
    banned: 'Personnes exclues',
    noBanned: "Personne. Les personnes que vous excluez depuis l'onglet Vue d'ensemble apparaissent ici.",
    letBackIn: 'Laisser revenir'
  },
  visibility: {
    public: { label: 'Public', description: 'Tout le monde peut entrer', tooltip: 'Public : tout le monde peut entrer' },
    protected: { label: 'Protégé', description: 'Accès par mot de passe', tooltip: 'Protégé : accès par mot de passe' },
    private: { label: 'Privé', description: 'Réservé à vous', tooltip: 'Privé : réservé à vous' }
  },
  locked: {
    by: 'par {{name}}',
    protected: 'Ce salon est protégé par un mot de passe.',
    join: 'Entrer',
    full: "Ce salon est complet ({{count}}/{{max}}). Vous entrerez dès qu'une place se libérera.",
    private: 'Ce salon est privé : seul son propriétaire peut y entrer.',
    banned: 'Le propriétaire vous a retiré de ce salon.'
  },
  confirm: {
    delete: 'Supprimer',
    cancel: 'Annuler'
  },
  time: {
    justNow: "à l'instant"
  },
  errors: {
    title: 'Erreur',
    room: {
      notFound: "Ce salon n'existe pas (ou plus)",
      ownerOnly: 'Seul le propriétaire du salon peut faire cela',
      passwordRequired: "Un salon protégé a besoin d'un mot de passe",
      banned: 'Le propriétaire vous a retiré de ce salon',
      private: 'Ce salon est privé',
      wrongPassword: 'Mot de passe incorrect',
      cannotKickSelf: 'Vous ne pouvez pas vous exclure vous-même'
    }
  }
}

export default fr
