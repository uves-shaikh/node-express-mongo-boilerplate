# 🎯 Interview Architecture Guide

## Quick Setup Commands
```bash
cp .env.example .env       # then fill in your values
npm install
npm run dev                # starts with hot reload via tsx watch
```

---

## Folder Structure
```
src/
├── config/         # env config + DB connection
├── controllers/    # HTTP layer only (thin)
├── middlewares/    # error handler, auth, validate
├── models/         # Mongoose schemas + instance methods
├── routes/         # route definitions + middleware composition
├── services/       # business logic (the real work)
├── types/          # Zod schemas + TypeScript types
└── utils/          # asyncHandler, response helpers, pagination
```

---

## Key Architectural Decisions (talk about these confidently)

### 1. Layered Architecture (Controller → Service → Model)
- **Controllers** are thin HTTP adapters: parse input, call service, send response
- **Services** own business logic — reusable, testable, transport-agnostic
- **Models** are data-layer only
- *Why it matters:* If you add GraphQL tomorrow, only the transport layer changes

### 2. Centralized Error Handling
- Single `errorHandler` middleware catches all errors
- `AppError` distinguishes operational vs programmer errors
- `asyncHandler` HOF eliminates try/catch in every controller
- Zod validation errors get 422 with field-level details automatically

### 3. Config Validated at Startup (`requireEnv`)
- Fails fast with a clear message if a required env var is missing
- Better than discovering a missing secret at 3am when a feature is hit

### 4. JWT Auth Structure
- Token signed with user `id` and `email`
- `authenticate` middleware populates `req.user` for downstream handlers
- Password excluded from JSON output via `toJSON` transform

### 5. Consistent API Response Envelope
```json
{ "success": true, "message": "...", "data": {...} }
{ "success": false, "message": "...", "errors": {...} }
```
- Frontend can always rely on this shape
- Paginated responses add a `meta` object

### 6. Graceful Shutdown
- Handles SIGTERM/SIGINT (Docker, K8s, PM2 stop)
- Stops accepting new connections, drains in-flight requests
- Force exits after 10s to prevent stuck processes

### 7. Security Layers
- `helmet` — secure HTTP headers
- `cors` — locked down in production
- `express-rate-limit` — brute-force and DDoS protection at app level
- JSON body size limit `10kb` — prevents payload-based DoS
- API versioned (`/api/v1`) — non-breaking future upgrades

---

## Likely Interviewer Follow-Up Questions

**Q: How would you add a new resource (e.g., Products)?**
> Create `product.model.ts`, `product.service.ts`, `product.controller.ts`, `product.routes.ts`, and add a Zod schema. Register the router in `routes/index.ts`. The pattern is identical — very low friction.

**Q: How would you scale this horizontally?**
> The app is stateless — JWT auth means no server-side sessions. You can run N instances behind a load balancer (Nginx, ALB). Use MongoDB Atlas or a replica set. Add Redis for rate limiting across instances (replace in-memory store with `rate-limit-redis`).

**Q: How would you add role-based access control (RBAC)?**
> The `User` model already has a `role` field. Create an `authorize(...roles)` middleware that checks `req.user.role` after `authenticate`. Apply it to routes that need it: `router.get('/', authenticate, authorize('admin'), ...)`.

**Q: How would you test this?**
> Unit test services in isolation (mock Mongoose models with `jest.mock`). Integration test routes with `supertest` + `mongodb-memory-server` (in-memory MongoDB, no real DB needed). Controllers are so thin they barely need separate tests.

**Q: How would you handle refresh tokens?**
> Store refresh tokens in the DB (or Redis) with expiry. Issue short-lived access tokens (15min) and long-lived refresh tokens (30d). Add `POST /auth/refresh` endpoint that validates the refresh token and issues a new access token.

**Q: Why Zod over express-validator or Joi?**
> Zod is TypeScript-first — schemas double as type definitions (`z.infer<typeof schema>`), giving you compile-time safety with zero duplication. It's lighter than Joi and more ergonomic than express-validator.

**Q: What's the difference between `SIGTERM` and `SIGINT`?**
> `SIGINT` is Ctrl+C in terminal. `SIGTERM` is what Docker/K8s/PM2 sends when stopping a container. Both should trigger graceful shutdown — that's why we handle both.

**Q: What would you add before going to production?**
> Structured logging (Winston/Pino), request ID tracing, Prometheus metrics endpoint, environment-aware CORS whitelist, MongoDB indexes on queried fields, DB connection pooling tuning, Swagger/OpenAPI docs, and CI/CD pipeline with automated tests.
