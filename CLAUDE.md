# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

pnpm workspace (version pinned by `packageManager`), Node 22+.

```bash
pnpm install              # also required after creating a new app package (links it)
pnpm start                # back (tsx watch, port 4001) + front (Vite --host), in parallel
pnpm start:server         # back only
pnpm start:client         # front only
pnpm build                # type-check back, then type-check + bundle front
pnpm --filter back build  # type-check the server side only (tsc, no emit)
pnpm --filter front exec tsc   # type-check the client side only, without bundling
pnpm lint                 # biome check --write: lints AND rewrites files (format + organize imports)
pnpm exec biome check <path>   # same checks, read-only
```

There are no tests (`pnpm test` is a stub). Type-checking is the correctness gate: run `pnpm build` after a change.

The apps (`projects/apps/*`) and `platform` have no tsconfig or build script of their own: their `server/` code is type-checked through `back`, their `client/` code through `front`, via the path aliases. The server is never compiled: `tsx` runs the TypeScript sources and resolves the aliases.

Local setup: `projects/back/src/constants/jwt.ts` is git-ignored and must exist: `export const JWT_SECRET_KEY = '…'`. The sibling repository `../mine.io` must exist too, with its dependencies installed (`pnpm install` there): `apps/mineio` links its library.

## Architecture

Real-time multiplayer mini-apps. A host (`back` + `front`) provides identification, rooms, presence and transport; each app is a package plugged into it through a contract defined in `platform`.

```
platform  ←  apps/*  ←  back   (imports each app's server/)
                     ←  front  (imports each app's client/)
```

Path aliases (tsconfig.base.json, resolved by tsx and by Vite's `tsconfigPaths`): `@platform/*`, `@apps/*`, `@back/*`, `@front/*`. `front` imports types from `@back` (`AppRouter`, `AppType`): keep those imports `import type`. Likewise an app's `client/` imports only types from its `../server`.

### One copy of tRPC

`platform` is the only package that depends on `@trpc/*`. Everything else imports tRPC from `@platform/server` (procedures, `TRPCError`, adapters) or `@platform/client` (`createTRPCReact`, links). Never import `@trpc/*` directly. This is what lets each app create its own `createTRPCReact<XxxApi>()` and still use the React context / QueryClient provided by the shell. For the same reason `front/vite.config.ts` dedupes `react`, `react-dom`, `@tanstack/react-query`, `@mantine/*`: a new library that relies on a React context shared between shell and apps must be added there.

### Router composition (back/src/router/index.ts)

- `clientRouter` = `public` + `protected` + one namespace per app, keyed by the app's `type` (`trpc.chess.*`, `trpc.word.*`…). Its type is `AppRouter`, what the shell client is typed against.
- The served router merges in the routers of the apps' external clients (`chessAI`), which are therefore absent from the shell's types.
- An app's `router` is a plain object of procedures, not a `router(...)` call. Its client is typed with `AppApi<typeof app>` (the full router reduced to that one namespace).
- `back/src/apps.ts` throws at startup on any namespace collision (host namespaces, app types, external namespaces).

### App registry

An app is registered with one line in `projects/back/src/apps.ts` (`serverApps`) and one in `projects/front/src/apps.ts` (`clientApps`). `clientApps` is `satisfies Record<AppType, ClientApp>`, so the build fails if an app exists on the server only. The step-by-step guide for a new app is in README.md ("Adding an app").

Board lifecycle: the room owner calls `protected.addBoard({ type, roomId })` → `findServerApp(type).create()` returns the board id → the room stores `{ id, type }`. `deleteBoard` calls the app's `remove()` (which checks ownership) before removing it from the room. In the shell, `Room.tsx` shows a permanent **Overview** tab first (`RoomOverview.tsx`: boards at a glance, who is in the room; it cannot be deleted and is the empty room's first-board picker), then one tab per board (`BoardTabs.tsx`, label and icon from the `ClientApp`), and renders the active board's `findClientApp(type).Component` with `AppProps` (`{ user, room, boardId }`) inside `Suspense`, keyed by board id. The active board is a local choice, mirrored in the URL (`#/room/<roomId>/<boardId>`, or `#/room/<roomId>` for the overview, via `replaceState` so the router does not react); it falls back to the overview when none is given or when it is missing or deleted. Components are `lazy()` so each app gets its own chunk. A `ClientApp` also declares `description`, `icon` and `color` (board picker, tabs, home cards, login page).

### Room access (back/src/repository/room.ts)

- A room has settings, chosen in a modal before it is created (`addNewRoom`) and changed by its owner at any time (`updateRoom`, ⚙ in `RoomHeader`; same `RoomSettingsForm`): `title`, `maxParticipants` (users present at the same time, owner included) and `visibility` (`ROOM_VISIBILITIES`, bounds in `ROOM_LIMITS`, both in `platform/model.ts`): **public**, **protected** (password, stored as a scrypt hash, `utils/password.ts`) or **private** (the owner only; hidden from the others' room list by `findRoomsFor`).
- `lockReason(room, userId)` is the single rule: owner → in; else banned → `banned`; private → `private`; protected and not in `members` (admitted by `joinRoom` with the password) → `password`; not present and the room is full → `full`. The capacity only stops newcomers: lowering it kicks nobody. Going protected admits the users present; going private empties `members`.
- `watchRoom` yields a `RoomView` (`joined` + the room, or `locked` + the reason and a `LockedRoom`) and re-evaluates it on every `roomTopic` publish (`openRoomSession`: the check and the presence join happen in the same tick, so two waiting users cannot both take the last spot). So users are let in or kept out live: a spot frees up, the password is accepted, the owner kicks someone out (`kickUser` = banned until `unbanUser`, listed in the settings modal) or makes the room private. The front shows `RoomLocked` instead of the room, which unmounts its boards. A deleted room ends the subscription with `NOT_FOUND`.
- `toRoom` never sends `passwordHash` nor `members`; `banned` only to the owner.
- Boards follow the rules of their room: the host puts `canAccessBoard(boardId)` in the tRPC context, and `boardProcedure` (platform) checks it (capacity ignored). The check runs when a subscription opens and on every mutation: a board subscription already open is not cut server-side.

### Two ways to write an app's server

Every procedure about one board uses `boardProcedure` from `@platform/server` (it adds `boardId` to the input and refuses a user who has no access to the board's room), not `protectedProcedure`.

- `defineYDocApp({ type, maxUpdateSize? })` — the board is a Yjs document (CRDT) plus awareness (cursors, pointers), relayed over tRPC (no y-websocket): `sync` subscription (snapshot first, then changes), `push`, `pushAwareness`. Binary payloads travel base64 (tRPC is JSON); `maxUpdateSize` caps a document update (paint raises it: pasted pictures are data URLs). The client side is shared in `platform/client`: `useYDoc` (document + awareness, `board` is null until the first sync) built on `syncYDoc` (`yDoc.ts`: pushes the diff against the last known server state vector, so a successful push also carries earlier failed ones; retries every 2 s; tags remote changes with a `REMOTE` origin so they are not echoed back), `usePeers(awareness, schema)` (validated participants, with the fields the app adds to the awareness state) and `PresenceBar` (built on `UserAvatars`; `userColor(userId)` gives a user the same color in every avatar, caret and pointer). The server drops a client's awareness state when its subscription ends. Used by **word** (text in a `Y.Text`, carets in the awareness) and **paint** (`Y.Map` of shapes + `Y.Array` of their order, glued to react-paint by `usePaintDoc`; pointers in the awareness).
- `defineServerApp({ type, create, remove, router, external? })` — custom logic. Used by **chess**: moves are validated server-side with the rules in `apps/chess/shared/`, shared with the client. And by **mineio**: the rules, bots and board come from `@yorab/mine.io` (sibling repository `../mine.io`, linked with `link:`; its `exports` point to TypeScript sources, type-checked here with Playground's options, and `front/vite.config.ts` allows `../../../mine.io` in `server.fs.allow`). The server owns the match (`createMatch` from `@yorab/mine.io/engine`, bots included, in-process) and only sends the public view: the hidden mines never leave it. Its `sync` subscription is a custom generator: a snapshot (lobby + encoded view + hovers) on subscription and on every lobby change, then numbered `events` (a client seeing a gap in `seq` subscribes again with a new `attempt`), and unnumbered `hover`s. Lobby: humans take a corner, the owner adds bots, sets the grid and starts; `backToLobby` keeps the corners. The client feeds the library's zustand store (`createBoardStore`) and renders its `MineBoard` positioned absolutely (its container's height comes from flex).

### Realtime model (platform/server/realtime.ts)

- A single in-process `EventEmitter` bus. `createTopic(name)` gives `publish(key)` / `listen(key)`.
- Subscriptions are async generators. `liveQuery({ topic, key, fetch, signal })` starts listening **before** the first fetch (no missed change), yields `fetch()` once, then re-fetches the whole value on each `publish(key)`; throws `NOT_FOUND` if the first fetch is undefined.
- So every mutation that changes state must `publish` the matching topic, otherwise watchers never see it (see `protectedRouter.ts`, `apps/chess/server/router.ts`).
- When writing a custom generator, follow the existing pattern: listen first, end quietly when `signal.aborted`, call `return()` on the listener in `finally`.
- `createPresence` tracks who watches what (per connection, so several tabs count once); `watchRoom` joins room presence while its user is let in (see Room access).

### Auth and context (back/src/services/context.ts)

- Users: nickname only, JWT signed with `JWT_SECRET_KEY`. Sent as `Authorization: Bearer` on HTTP, as `connectionParams.token` on the WebSocket.
- External clients (bots/agents): an API key (`x-api-key` header or `connectionParams.apiKey`) maps to permissions in `back/src/constants/permissions.ts`; the app whose `external.permission` matches authenticates the client from its connection params (chess: `name` → AI user). Their procedures use `withPermissionsProcedure(permission)`.
- Front (`front/src/hooks/useTrpc.ts`): queries/mutations over `httpBatchLink`, subscriptions over a lazy `wsLink`. The WS reads the token when it connects: call `resetWsClient()` after the token changes.
- A global `MutationCache.onError` shows a notification for every failed mutation (shell and apps); a mutation that displays its own error opts out with `meta: { handlesError: true }`.

### Storage

Everything is in memory (`Map`s in `platform/server/boardStore.ts`, `back/src/repository/*`, `apps/chess/server/store.ts`, `apps/mineio/server/store.ts`): a server restart wipes all users, rooms and boards. `platform/server/users.ts` is the shared user store that apps can read.

## Scope decisions

Deliberate choices for this sandbox — don't propose changing them unless asked:
- Identification stays nickname + JWT, no password; auth hardening is out of scope.
- Storage stays in memory; no database.
- Transport stays tRPC (no Convex/Supabase/Colyseus, no y-websocket/Hocuspocus).
- One package per app under `projects/apps/<name>`, with its own dependencies.

## Conventions

- Biome formatting: single quotes (JSX too), no semicolons, no trailing commas, arrow parens only when needed, 2 spaces, line width 150. `pnpm lint` applies it.
- UI: Mantine 9 components, CSS modules (`*.module.css`), icons from `@tabler/icons-react`. Theme in `front/src/theme.ts` (violet, Inter for text and Outfit for headings via `@fontsource-variable`, default props of Card/Modal/Tooltip/Badge); the main area has a tinted background (`Router.module.css`) so cards and panels stand out. UI text is in English. In CSS modules, write breakpoints as literal values (`@media (max-width: 47.99em)`): Biome rejects the `$mantine-breakpoint-*` variables.
- Front routing is hash based (`#/home`, `#/room/<id>`, `#/room/<id>/<boardId>`). A logged-out visitor sent to `#/login` returns to the page they asked for once logged in (invitation links).
