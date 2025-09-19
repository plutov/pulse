## Pulse

Pulse is a self-hosted, open-source monitoring dashboard that acts as your personal watchdog.

## Tech Stack

- hapi
- kanel
- knex
- vitess
- pino

## Running locally

Prepare the config:

```
cp .env.example .env
```

Start Postgres/Redis locally with Docker:

```
docker-compose up -d
```

Run migrations and start the server:

```
npm run db:migrate
npm run db:seed
npm run dev
```

## Generate Code

```
npm run types:generate
npm run oapi
```

## Test

Using testcontainers:

```
npm run test
```
