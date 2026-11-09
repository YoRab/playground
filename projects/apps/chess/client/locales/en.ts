/** Texts of the chess app (namespace `chess`, its type): the reference dictionary */
const en = {
  label: 'Chess',
  description: 'Play a friend or an AI, every move checked by the server',
  result: {
    stalemate: 'Stalemate',
    draw: 'Nobody can move: it is a draw.',
    wins: '{{name}} wins',
    someone: 'Someone',
    resigned: '{{name}} resigned.',
    theOpponent: 'The opponent',
    checkmate: 'Checkmate.'
  },
  moves: {
    title: 'Moves',
    none: 'No move yet',
    white: 'White',
    black: 'Black'
  },
  resign: {
    button: 'Resign',
    confirm: 'Resign this game?',
    cancel: 'Cancel'
  },
  setup: {
    waiting: 'Waiting for an opponent',
    vsHuman: 'Play against a human',
    vsAI: 'Play against {{name}}',
    playWhite: 'Play white',
    playBlack: 'Play black'
  },
  promotion: {
    title: 'Pawn promotion',
    hint: 'Choose a piece to promote your pawn to'
  },
  pieces: {
    queen: 'Queen',
    rook: 'Rook',
    bishop: 'Bishop',
    knight: 'Knight'
  },
  player: {
    waiting: 'Waiting for a player',
    you: '(you)',
    ai: 'AI',
    yourTurn: 'Your turn',
    toMove: 'To move'
  }
}

export default en

declare module '@platform/client/i18n' {
  interface Namespaces {
    chess: typeof en
  }
}
