import type { TranslationOf } from '@platform/client'
import type en from './en'

const fr: TranslationOf<typeof en> = {
  label: 'Échecs',
  description: 'Affrontez un ami ou une IA, chaque coup vérifié par le serveur',
  result: {
    stalemate: 'Pat',
    draw: 'Plus personne ne peut jouer : partie nulle.',
    wins: '{{name}} gagne',
    someone: "Quelqu'un",
    resigned: '{{name}} a abandonné.',
    theOpponent: "L'adversaire",
    checkmate: 'Échec et mat.'
  },
  moves: {
    title: 'Coups',
    none: 'Aucun coup pour le moment',
    white: 'Blancs',
    black: 'Noirs'
  },
  resign: {
    button: 'Abandonner',
    confirm: 'Abandonner cette partie ?',
    cancel: 'Annuler'
  },
  setup: {
    waiting: "En attente d'un adversaire",
    vsHuman: 'Jouer contre un humain',
    vsAI: 'Jouer contre {{name}}',
    playWhite: 'Jouer les blancs',
    playBlack: 'Jouer les noirs'
  },
  promotion: {
    title: 'Promotion du pion',
    hint: 'Choisissez la pièce en laquelle promouvoir votre pion'
  },
  pieces: {
    queen: 'Dame',
    rook: 'Tour',
    bishop: 'Fou',
    knight: 'Cavalier'
  },
  player: {
    waiting: "En attente d'un joueur",
    you: '(vous)',
    ai: 'IA',
    yourTurn: 'À vous de jouer',
    toMove: 'Au trait'
  }
}

export default fr
