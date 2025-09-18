### Tech stack

- hapi
- kanel
- knex

### Running locally

Prepare the config:
```
cp .env.example .env
```

Start Postgres locally with Docker:
```
docker-compose up -d
```

Run migrations and start the server:
```
npm run db:migrate
npm run db:seed
npm run types:generate
npm run dev
```

### Generate

```
npm run types:generate
npm run oapi
```

### Test

Using testcontainers:

```
npm run test
```
