/** Texts of the Word app (namespace `word`, its type): the reference dictionary */
const en = {
  label: 'Word',
  description: "A shared text: write together and see everyone's cursor",
  editor: 'Text of the board'
}

export default en

declare module '@platform/client/i18n' {
  interface Namespaces {
    word: typeof en
  }
}
