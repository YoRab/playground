# Playground

A full-stack monorepo application featuring multiple interactive games and applications including Chess (with AI), Paint, and Word games. Built with TypeScript, React, Express, and tRPC for type-safe communication.

## 🎮 Features

- **Chess Game**: Interactive chess with AI opponent support
- **Paint Application**: Collaborative drawing/painting tool
- **Word Game**: Word-based game functionality
- **Real-time Communication**: WebSocket support for live updates
- **Authentication**: JWT-based user authentication
- **Type-Safe API**: End-to-end type safety with tRPC

## 🏗️ Project Structure

This is a monorepo workspace managed with pnpm workspaces, containing three main projects:

```
playground/
├── projects/
│   ├── back/          # Backend server (Express + tRPC)
│   ├── front/         # Frontend application (React + Vite)
│   └── common/        # Shared TypeScript types and models
├── package.json       # Root workspace configuration
└── README.md
```

### Backend (`projects/back`)
- Express server with tRPC
- WebSocket support for real-time communication
- JWT authentication
- Modular architecture with separate routers for each game/feature
- Modules: Chess (with AI), Paint, Word

### Frontend (`projects/front`)
- React 18 with TypeScript
- Vite for fast development and building
- tRPC client with React Query
- Drag-and-drop functionality (@dnd-kit)
- Hash-based routing
- Components for Chess, Paint, Word, and Room management

### Common (`projects/common`)
- Shared TypeScript type definitions
- Models used across frontend and backend

## 🛠️ Tech Stack

### Backend
- **Express**: Web server framework
- **tRPC**: End-to-end typesafe APIs
- **WebSocket (ws)**: Real-time bidirectional communication
- **JWT (jsonwebtoken)**: Authentication
- **Zod**: Schema validation
- **TypeScript**: Type safety

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **tRPC Client**: Type-safe API client
- **React Query (@tanstack/react-query)**: Data fetching and caching
- **@dnd-kit**: Drag and drop functionality
- **@yorab/react-paint**: Paint component library
- **TypeScript**: Type safety

### Development Tools
- **Biome**: Fast linter and formatter
- **TypeScript**: Type checking
- **pnpm workspaces**: Monorepo management

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (the exact version is pinned by `packageManager` in the root `package.json`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playground
```

2. Install dependencies:
```bash
pnpm install
```

This will install dependencies for all workspace projects.

### Development

Start both the backend and frontend in development mode:

```bash
pnpm start
```

This runs:
- Backend server on `http://localhost:4001` (or PORT from environment)
- Frontend dev server (accessible via the host network)

Or run them separately:

```bash
# Backend only
pnpm start:server

# Frontend only
pnpm start:client
```

### Building

Build all projects:

```bash
pnpm build
```

Build individual projects:

```bash
pnpm build:common   # Build shared types
pnpm build:server   # Build backend
pnpm build:client   # Build frontend
```

### Linting

Format and lint all projects:

```bash
pnpm lint
```

## 📜 Available Scripts

### Root Level
- `pnpm start` - Start both backend and frontend concurrently
- `pnpm start:server` - Start backend only
- `pnpm start:client` - Start frontend only
- `pnpm build` - Build all projects
- `pnpm build:common` - Build common package
- `pnpm build:server` - Build backend
- `pnpm build:client` - Build frontend
- `pnpm lint` - Lint and format all projects

### Backend (`projects/back`)
- `pnpm start` - Build and start production server
- `pnpm dev` - Start development server with nodemon
- `pnpm build` - Compile TypeScript

### Frontend (`projects/front`)
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

## 🔧 Configuration

### Environment Variables

The backend server uses the following environment variable:
- `PORT`: Server port (default: 4001)

### TypeScript Configuration

Each project has its own `tsconfig.json` with path aliases configured:
- Backend: `@back/*` aliases
- Frontend: `@front/*` aliases
- Common: Shared types

## 📁 Key Directories

### Backend Structure
```
back/src/
├── api/              # API route handlers
├── modules/          # Feature modules (chess, paint, word)
│   ├── chess/        # Chess game logic and AI
│   ├── paint/        # Paint application
│   └── word/         # Word game
├── repository/       # Data access layer
├── router/           # tRPC routers
├── services/         # Core services (context, trpc)
└── utils/            # Utility functions
```

### Frontend Structure
```
front/src/
├── components/       # React components
│   ├── chessboard/   # Chess board components
│   ├── paint/        # Paint component
│   ├── word/         # Word game component
│   └── ...
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── constants/        # Application constants
```

## 🔐 Authentication

The application uses JWT-based authentication. Users can:
- Login through the `/login` route
- Access protected routes after authentication
- Use authenticated tRPC procedures

## 🌐 API

The backend exposes a tRPC API with:
- Public routes (authentication, public data)
- Protected routes (user-specific, game actions)
- WebSocket subscriptions for real-time updates

## 📝 License

ISC

## 👤 Author

Yohann Rabatel
