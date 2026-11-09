/**
 * Texts of the Mine.io app (namespace `mineio`, its type): the reference dictionary. The labels the mine.io library gives
 * in English (corners, levels, presets, diagonals, chording, end reasons) are translated here by their key.
 */
const en = {
  label: 'Mine.io',
  description: 'Real-time territory minesweeper, up to four players and bots',
  lobby: {
    intro:
      'Real-time territory minesweeper: reveal cells from your corner, close zones (they become yours), build a lead nobody can catch up with. A mine stuns you for 5 seconds.',
    takeCorner: 'Take this corner',
    moveHere: 'Move here',
    addBot: 'Add a bot',
    removeBot: 'Remove this bot',
    leave: 'Leave',
    start: 'Start the game',
    needTwo: 'Two players needed (add a bot)',
    waitingOwner: 'Waiting for the owner of the board to start the game…'
  },
  settings: {
    grid: 'Grid',
    mines: 'Mines: {{percent}}',
    diagonals: 'Diagonals',
    chording: 'Chording',
    chordingDescription: 'Click or tap a number with as many flags (or exploded mines) around it: its other neighbours are revealed at once.'
  },
  // in the order of the corners of the library (SEAT_LABELS)
  seats: {
    topLeft: 'Top left',
    topRight: 'Top right',
    bottomRight: 'Bottom right',
    bottomLeft: 'Bottom left'
  },
  levels: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  },
  bots: {
    easy: 'Easy bot',
    medium: 'Medium bot',
    hard: 'Hard bot'
  },
  presets: {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  },
  diagonals: {
    leak: { label: 'Open', description: 'Players move diagonally: a wall only closes a zone when it is continuous by the sides.' },
    block: { label: 'Closed', description: 'Nobody slips diagonally between two taken cells: a staircase wall closes a zone.' }
  },
  game: {
    menu: 'Game',
    stop: 'Stop and go back to the lobby',
    watching: 'You are watching this game.',
    touch: 'Tap: reveal · long press: flag (only for you)',
    touchChord: 'tap a number: reveal around it',
    touchMove: 'drag, pinch: move, zoom',
    mouse: 'Click: reveal · right click: flag (only for you)',
    mouseChord: 'click a number: reveal around it',
    mouseMove: 'drag, wheel: move, zoom'
  },
  result: {
    tie: 'Tie!',
    youWin: 'You win!',
    wins: '{{name}} wins',
    someone: 'Someone',
    playAgain: 'Play again',
    ownerCanRestart: 'The owner can start another game.'
  },
  endReasons: {
    majority: 'More than half of the grid is taken.',
    unbeatable: 'Nobody can catch up with the leader anymore.',
    exhausted: 'No safe cell is left to reveal.'
  },
  // the keys of the `i18nError`s thrown by apps/mineio/server
  errors: {
    boardNotFound: 'This Mine.io board does not exist (anymore)',
    ownerOnly: 'Only the owner of the board can do this',
    alreadyStarted: 'The game has already started',
    cornerTaken: 'This corner is taken',
    twoPlayersNeeded: 'A game needs at least two players',
    notStarted: 'The game has not started',
    notPlaying: 'You are not playing this game'
  }
}

export default en

declare module '@platform/client/i18n' {
  interface Namespaces {
    mineio: typeof en
  }
}
