# Pulse Monorepo

Pulse is a self-hosted, open-source monitoring dashboard that acts as your personal watchdog.

## Structure

This is a monorepo built with Turborepo.

## Tech Stack

**Backend (API)**
- Hapi.js
- Kanel
- Knex
- Vitest
- Pino
- Postgres

**Frontend (Web)**
- Vue 3 + TypeScript
- Vue Router
- Pinia
- Vite

## Getting Started

### Prerequisites

- Node.js 24+
- npm
- Docker

### Running Locally

Install all dependencies across the monorepo:

```bash
npm install
```

Start the local PostgreSQL using Docker:

```bash
cd apps/api
docker-compose up -d
npm run db:migrate
npm run db:seed
```

**Start all applications:**

```bash
npm run dev
```

This will start:
- API server at http://localhost:3000
- Vue.js frontend at http://localhost:9000

### Linting

Run linting across all projects:
```bash
npm run lint
```

### Testing

Run tests across all projects:
```bash
npm run test
npm run coverage
```

## Generate Code

### Database Types
```bash
cd apps/api
npm run generate:db
```

### API Types (Shared)
```bash
cd packages/shared
npm run generate
npm run build
```

