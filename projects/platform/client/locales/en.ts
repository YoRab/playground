/** Texts of the components shared by the host and the apps (namespace `platform`): the reference dictionary */
const en = {
  loading: 'Loading…',
  you: '{{name}} (you)',
  boardUnavailable: 'Board unavailable',
  presence: {
    alone: 'Only you on this board',
    others_one: '{{count}} other on this board',
    others_other: '{{count}} others on this board',
    offline: 'Offline: your changes will be sent when the connection is back'
  },
  // the keys of the `i18nError`s thrown by platform/server
  errors: {
    unauthorized: 'You are not logged in',
    noAccess: 'You do not have access to this room',
    notFound: 'This does not exist anymore',
    boardNotFound: 'This board does not exist (anymore)',
    invalidUpdate: 'This change could not be applied'
  }
}

export default en
