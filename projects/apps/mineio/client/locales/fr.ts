import type { TranslationOf } from '@platform/client'
import type en from './en'

const fr: TranslationOf<typeof en> = {
  label: 'Mine.io',
  description: "Démineur de territoire en temps réel, jusqu'à quatre joueurs et des bots",
  lobby: {
    intro:
      'Démineur de territoire en temps réel : révélez des cases depuis votre coin, fermez des zones (elles deviennent les vôtres), prenez une avance que personne ne peut rattraper. Une mine vous étourdit pendant 5 secondes.',
    takeCorner: 'Prendre ce coin',
    moveHere: 'Venir ici',
    addBot: 'Ajouter un bot',
    removeBot: 'Retirer ce bot',
    leave: 'Quitter',
    start: 'Lancer la partie',
    needTwo: 'Deux joueurs nécessaires (ajoutez un bot)',
    waitingOwner: 'En attente du lancement de la partie par le propriétaire du tableau…'
  },
  settings: {
    grid: 'Grille',
    mines: 'Mines : {{percent}}',
    diagonals: 'Diagonales',
    chording: 'Ouverture rapide',
    chordingDescription:
      "Cliquez ou touchez un nombre entouré d'autant de drapeaux (ou de mines explosées) : ses autres voisines sont révélées d'un coup."
  },
  seats: {
    topLeft: 'En haut à gauche',
    topRight: 'En haut à droite',
    bottomRight: 'En bas à droite',
    bottomLeft: 'En bas à gauche'
  },
  levels: {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile'
  },
  bots: {
    easy: 'Bot facile',
    medium: 'Bot moyen',
    hard: 'Bot difficile'
  },
  presets: {
    small: 'Petite',
    medium: 'Moyenne',
    large: 'Grande'
  },
  diagonals: {
    leak: { label: 'Ouvertes', description: "Les joueurs passent en diagonale : un mur ne ferme une zone que s'il est continu par les côtés." },
    block: { label: 'Fermées', description: 'Personne ne se glisse en diagonale entre deux cases prises : un mur en escalier ferme une zone.' }
  },
  game: {
    menu: 'Partie',
    stop: 'Arrêter et revenir au lobby',
    watching: 'Vous regardez cette partie.',
    touch: 'Toucher : révéler · appui long : drapeau (pour vous uniquement)',
    touchChord: 'toucher un nombre : révéler autour',
    touchMove: 'glisser, pincer : déplacer, zoomer',
    mouse: 'Clic : révéler · clic droit : drapeau (pour vous uniquement)',
    mouseChord: 'cliquer sur un nombre : révéler autour',
    mouseMove: 'glisser, molette : déplacer, zoomer'
  },
  result: {
    tie: 'Égalité !',
    youWin: 'Vous gagnez !',
    wins: '{{name}} gagne',
    someone: "Quelqu'un",
    playAgain: 'Rejouer',
    ownerCanRestart: 'Le propriétaire peut lancer une autre partie.'
  },
  endReasons: {
    majority: 'Plus de la moitié de la grille est prise.',
    unbeatable: 'Plus personne ne peut rattraper la personne en tête.',
    exhausted: 'Il ne reste aucune case sûre à révéler.'
  },
  errors: {
    boardNotFound: "Ce tableau Mine.io n'existe pas (ou plus)",
    ownerOnly: 'Seul le propriétaire du tableau peut faire cela',
    alreadyStarted: 'La partie a déjà commencé',
    cornerTaken: 'Ce coin est pris',
    twoPlayersNeeded: 'Une partie demande au moins deux joueurs',
    notStarted: "La partie n'a pas commencé",
    notPlaying: 'Vous ne participez pas à cette partie'
  }
}

export default fr
