// tRPC client runtime: always imported from here so that the host and the apps share one copy
// (the apps' `createTRPCReact()` instances then use the React context provided by the host)
export { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client'
export { createTRPCReact, getQueryKey } from '@trpc/react-query'
export { type AppProps, type ClientApp, defineClientApp } from './defineApp'
export { default as ErrorAlert } from './ErrorAlert'
export { default as Loading } from './Loading'
export { default as PresenceBar } from './PresenceBar'
export { type Peer, peerColorVar, usePeers } from './peers'
export { useYDoc, type YBoard } from './useYDoc'
