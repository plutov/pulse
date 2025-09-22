# Agent Instructions

## How to Work with API

Follow these steps in order when making API changes:

### OpenAPI Specification First

- **Always start** with updating the OpenAPI specification in `packages/shared/openapi.yaml`
- Define your API endpoints, request/response schemas, and validation rules
- Use descriptive names and proper HTTP status codes
- Follow RESTful conventions for endpoint naming

### Generate and Build Types

After updating the OpenAPI spec:

```bash
cd packages/shared
npm run generate  # Generates TypeScript types from OpenAPI
npm run build     # Builds the shared package
```

This creates TypeScript types in `packages/shared/src/apigen/` that both `api` and `web` applications can use.

### Database Schema and Migrations

For database changes:

- Create migrations in `apps/api/database/migrations/`
- Use snake_case for PostgreSQL field names
- Generate database types after running migrations
- Database types are generated in `apps/api/src/database/types/`

### API Implementation

When implementing API endpoints:

- Use the generated types from `@pulse/shared`
- Implement endpoints in `apps/api/src/plugins/`
- **Important**: API fields use camelCase, PostgreSQL fields use snake_case
- Always use converters when mapping between API and database models
- All fields must be validated using Joi schemas defined in `apps/api/src/api/schemas.ts`

### Testing Requirements

**All API changes must be covered with tests:**

- Write integration tests in `apps/api/tests/integration/`
- We use **testcontainers** for database testing
- Tests should cover:
  - Happy path scenarios
  - Error cases (400, 404, 409, etc.)
  - Input validation
  - Authentication/authorization
- Follow the existing test patterns in `monitors.test.ts`

### Field Naming Convention

**Critical**: Be careful with field name conversions:

- **API/Frontend**: `camelCase` (e.g., `monitorType`, `createdAt`)
- **Database**: `snake_case` (e.g., `monitor_type`, `created_at`)
- **Always use converters** to transform between these formats
- Never expose snake_case fields in API responses
- Never send camelCase fields directly to database queries

### Example Workflow

1. Update `packages/shared/openapi.yaml` with new endpoint
2. Run `npm run generate && npm run build` in `packages/shared`
3. Create database migration if needed
4. Implement API endpoint using generated types
5. Add field converters for camelCase ↔ snake_case
6. Write comprehensive integration tests
7. Verify tests pass with testcontainers

## How to Work with Web

### Tech Stack

- Quasar
- Vue 3
- Pinia
- Vue Router
- Axios
- TypeScript

### API Integration

1. Use API types from `@pulse/shared`
