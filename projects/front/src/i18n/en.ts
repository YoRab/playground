/** Texts of the host (namespace `host`): the reference dictionary, every other language has the same keys */
const en = {
  common: {
    unknownUser: 'an unknown user'
  },
  toolbar: {
    navigation: 'main navigation',
    account: 'Account',
    signedInAs: 'Signed in as {{name}}',
    logout: 'Log out',
    language: 'Language',
    colorScheme: 'Color scheme'
  },
  colorScheme: {
    light: 'Light',
    dark: 'Dark',
    auto: 'System'
  },
  login: {
    tagline: 'Real-time mini-apps to play and create together.',
    title: 'Pick a nickname',
    subtitle: 'No account, no password: a nickname is all it takes.',
    nickname: 'Nickname',
    placeholder: 'e.g. Ada',
    tooShort: 'Your nickname must contain at least 2 letters',
    submit: 'Start playing'
  },
  home: {
    title: 'Rooms',
    subtitle: 'Join a room, or open your own and invite your friends.',
    unavailable: 'Rooms unavailable',
    newRoom: 'New room',
    createRoom: 'Create room',
    defaultRoomTitle: "{{name}}'s room",
    empty: 'No room yet',
    emptyHint: 'Open one and share its link with your friends.',
    deleteTitle: 'Delete room',
    deleteBody: 'Delete <strong>{{title}}</strong> and all its boards?'
  },
  roomCard: {
    noBoard: 'No board yet',
    delete: 'Delete this room',
    you: 'You',
    unknownOwner: 'Unknown',
    nobody: 'Nobody here',
    full: 'Full',
    online: '{{count}} online',
    onlineOf: '{{count}}/{{max}} online',
    join: 'Join'
  },
  room: {
    allRooms: 'All rooms',
    unavailable: 'Room unavailable',
    settings: 'Room settings',
    participants: 'In the room / max participants',
    addBoard: 'Add a board',
    unknownType: 'Unknown board type: {{type}}',
    deleteBoardTitle: 'Delete board',
    deleteBoardBody: 'Delete this board for everyone in the room?',
    kickTitle: 'Kick out',
    kickBody: "Kick <strong>{{name}}</strong> out of the room? They won't be able to come back until you let them in from the room settings.",
    kickConfirm: 'Kick out'
  },
  tabs: {
    overview: 'Overview',
    deleteBoard: 'Delete this board'
  },
  overview: {
    boards: 'Boards',
    pickFirst: 'Pick an app to add the first board: everyone in the room will see it.',
    waiting: 'Waiting for {{name}} to add a board',
    theOwner: 'the owner',
    open: 'Open',
    deleteBoard: 'Delete {{label}}',
    inTheRoom: 'In the room',
    createdBy: 'Created by {{name}}',
    createdByYou: 'Created by you',
    nobody: 'Nobody is here.',
    owner: 'Owner',
    kick: 'Kick {{name}} out'
  },
  invite: {
    button: 'Invite',
    title: 'Invite people',
    protected: 'Share this link and the password: they are asked once, after picking a nickname.',
    public: 'Anyone with this link can join the room after picking a nickname.',
    link: 'Invitation link',
    copy: 'Copy',
    copied: 'Copied'
  },
  settings: {
    name: 'Name',
    nameRequired: 'Give the room a name',
    whoCanJoin: 'Who can join',
    password: 'Password',
    passwordHint: 'Whoever joins the room types it once',
    keepPassword: 'Leave empty to keep the current password',
    passwordRequired: 'A protected room needs a password',
    passwordTooShort: 'At least {{min}} characters',
    maxParticipants: 'Max participants',
    participantsRange: 'Between {{min}} and {{max}}',
    youIncluded: 'You included',
    privateHint: 'Only you can enter a private room',
    save: 'Save',
    banned: 'Banned',
    noBanned: 'Nobody. The users you kick out from the Overview tab appear here.',
    letBackIn: 'Let back in'
  },
  visibility: {
    public: { label: 'Public', description: 'Anyone can join', tooltip: 'Public: anyone can join' },
    protected: { label: 'Protected', description: 'Join with a password', tooltip: 'Protected: join with a password' },
    private: { label: 'Private', description: 'Only you can enter', tooltip: 'Private: only you can enter' }
  },
  locked: {
    by: 'by {{name}}',
    protected: 'This room is protected by a password.',
    join: 'Join',
    full: 'This room is full ({{count}}/{{max}}). You will enter as soon as a spot frees up.',
    private: 'This room is private: only its owner can enter.',
    banned: 'The owner removed you from this room.'
  },
  confirm: {
    delete: 'Delete',
    cancel: 'Cancel'
  },
  time: {
    justNow: 'just now'
  },
  errors: {
    title: 'Error',
    // the keys of the `i18nError`s thrown by back/src/repository/room.ts
    room: {
      notFound: 'This room does not exist (anymore)',
      ownerOnly: 'Only the owner of the room can do this',
      passwordRequired: 'A protected room needs a password',
      banned: 'The owner removed you from this room',
      private: 'This room is private',
      wrongPassword: 'Wrong password',
      cannotKickSelf: 'You cannot kick yourself out'
    }
  }
}

export default en

declare module '@platform/client/i18n' {
  interface Namespaces {
    host: typeof en
  }
}
