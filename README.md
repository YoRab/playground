# Playground

A sandbox for real-time multiplayer mini-apps (chess with AI, paint, word…). A host shell provides identification, rooms, presence and real-time transport; each app is a self-contained package plugged into it. TypeScript end to end, with React, Vite and tRPC.

## 🎮 Features

- **Rooms**: create a room, invite people, add boards (one board = one app instance)
- **Chess**: moves validated by the server, play against a human or an external AI client
- **Paint**: shared drawing synced with Yjs (shapes drawn at the same time merge, pointers of the others shown)
- **Word**: shared text synced with Yjs (concurrent edits merge, remote cursors shown)
- **Mine.io**: real-time territory minesweeper against humans and bots, the server holding the mines and running the bots (from the sibling repository [mine.io](../mine.io))
- **Real-time**: tRPC subscriptions over WebSocket, live presence of the users in a room
- **Identification**: nickname only, JWT token (no password)
- **Storage**: in memory (everything is lost when the server restarts)

## 🏗️ Project Structure

A pnpm workspace:

```
playground/
├── projects/
│   ├── platform/      # SDK shared by the host and the apps (the only package depending on tRPC)
│   │   ├── server/    #   tRPC instance & procedures, realtime topics, presence, board store, app contract
│   │   ├── client/    #   app contract, tRPC client runtime, shared UI (Loading)
│   │   └── model.ts   #   User, Room, Board
│   ├── apps/          # one package per app
│   │   ├── chess/     #   shared/ (rules), server/ (game + AI client API), client/ (board UI)
│   │   ├── mineio/    #   server/ (lobby, match, bots), client/ (lobby, board of @yorab/mine.io)
│   │   ├── paint/
│   │   └── word/
│   ├── back/          # host server: entry point, identification, rooms, app registry
│   └── front/         # host shell: login, home, room screen, app registry
├── tsconfig.base.json # path aliases: @platform/*, @apps/*, @back/*, @front/*
└── pnpm-workspace.yaml
```

Dependency graph: `platform` ← `apps/*` ← `back` (the `server/` entries) and `front` (the `client/` entries).

`apps/mineio` depends on the library of the sibling repository `mine.io`, through a local link (`link:../../../../mine.io/packages/mine.io`): clone it next to this repository and run `pnpm install` in it before installing here.

## 🧩 Adding an app

1. Create `projects/apps/<name>/` with a `package.json` (`"name": "@apps/<name>"`, its own dependencies, e.g. `react`, `zod`).
2. **Server** – `server/index.ts`:
   ```ts
   import { type AppApi, defineYDocApp } from '@platform/server'

   const notes = defineYDocApp({ type: 'notes' })

   export default notes
   export type NotesApi = AppApi<typeof notes>
   ```
   `defineYDocApp` is enough when a board is a shared document: it generates the board lifecycle and the Yjs sync procedures (concurrent edits merge). The client side comes with it: `useYDoc`, `usePeers` and `PresenceBar` from `@platform/client` (see `apps/word/client`). For custom logic, use `defineServerApp({ type, create, remove, router })` with `createTopic` / `liveQuery` (see `apps/chess/server`).
3. **Client** – `client/trpc.ts` (`createTRPCReact<NotesApi>()` from `@platform/client`), a component receiving `AppProps` (`{ user, room, boardId }`), and `client/index.ts`:
   ```ts
   export default defineClientApp({ label: 'Notes', Component: lazy(() => import('./Notes')) })
   ```
4. **Register** it: one line in [projects/back/src/apps.ts](projects/back/src/apps.ts) and one in [projects/front/src/apps.ts](projects/front/src/apps.ts). The build fails if an app is registered on the server and not on the client.
5. `pnpm install` to link the new package.

Rules of thumb:
- the `type` of an app is its tRPC namespace (`trpc.<type>.*`): it must be unique and must not be `public` or `protected` (nor the namespace of an external client). The server refuses to start otherwise;
- import tRPC only from `@platform/server` / `@platform/client`, never from `@trpc/*`: one copy of tRPC at runtime is what lets the apps share the React context of the shell.

### External clients (bots, agents)

An app can let a client living outside the shell play in it, by declaring `external` in `defineServerApp`. The host needs no change: it reads what the apps declare.

```ts
defineServerApp({
  type: 'chess',
  // …
  external: {
    namespace: 'chessAI',                 // procedures served as trpc.chessAI.*, hidden from the shell client's types
    permission: 'chess-ia',               // permission the client needs (guard the procedures with withPermissionsProcedure)
    authenticate: ({ name }: ExternalParams) => (name ? findOrCreateAI(name) : null),  // who is it, from the WebSocket connection params
    router: chessAIRouter
  }
})
```

The only host-side configuration is the API key → permission table in [projects/back/src/constants/permissions.ts](projects/back/src/constants/permissions.ts). Annotate the parameter of `authenticate`: TypeScript then keeps the precise type of `router`.

## 🛠️ Tech Stack

- **Server**: tRPC 11 (standalone HTTP adapter + `ws` WebSocket adapter), Zod 4, jsonwebtoken, run from the sources with **tsx**
- **Client**: React 19, Vite 8, tRPC React Query client, @dnd-kit (chess), @yorab/react-paint (paint), Yjs (word, paint)
- **Tooling**: TypeScript 7, Biome 2, pnpm workspaces

## 🚀 Getting Started

Prerequisites: Node.js 22+ and pnpm (version pinned by `packageManager` in the root `package.json`).

```bash
pnpm install
pnpm start          # backend (tsx watch, port 4001) + frontend (Vite, exposed on the network)
```

Or separately: `pnpm start:server`, `pnpm start:client`.

## 📜 Available Scripts

### Root Level
- `pnpm start` - Start backend and frontend in development mode
- `pnpm start:server` / `pnpm start:client` - Start one of them
- `pnpm build` - Type check the backend, then type check and bundle the frontend
- `pnpm lint` - Lint and format (back, front, platform, apps)

### Backend (`projects/back`)
- `pnpm dev` - Start the server with `tsx watch` (restarts on any change in back, platform or apps)
- `pnpm start` - Start the server with `tsx` (no compilation step: tsx resolves the path aliases)
- `pnpm build` - Type check only

### Frontend (`projects/front`)
- `pnpm dev` - Start the Vite dev server
- `pnpm build` - Type check and build for production (one chunk per app)
- `pnpm preview` - Preview the production build

## 🔧 Configuration

| Variable | Used by | Default |
|---|---|---|
| `PORT` | backend | `4001` |
| `VITE_API_URL` | frontend | same host as the page, port `4001` |
| `VITE_WS_URL` | frontend | `VITE_API_URL` with the `ws` protocol |

The JWT secret is read from `projects/back/src/constants/jwt.ts` (git-ignored): `export const JWT_SECRET_KEY = '…'`.

## 🌐 API

The tRPC router of the backend is made of:
- `public`: login, current user, live list of rooms
- `protected`: rooms (create, delete, watch with presence) and boards (add/remove, delegated to the app registry)
- one namespace per app (`chess`, `paint`, `word`)
- the namespaces of the external clients declared by the apps (`chessAI` for the chess AIs, authenticated by an API key: `apiKey` + `name` in the WebSocket connection params). They are served but not part of the type of the shell client

## 📝 License

ISC

## 👤 Author

Yohann Rabatel
