# Scalability Notes

This document outlines how the Task Management API can scale as traffic and feature requirements grow.

## Current Architecture

```
Client (React) → REST API (Express) → PostgreSQL
                      ↓
                 Swagger Docs
```

The backend follows a **modular monolith** pattern: each domain (auth, tasks) lives in its own module with separate routes, controllers, services, and validators. This makes it straightforward to extract modules into microservices later without rewriting business logic.

## Horizontal Scaling

### API Layer
- Run multiple API instances behind a **load balancer** (Nginx, AWS ALB, or Kubernetes Ingress).
- Keep instances **stateless** — JWT auth requires no server-side session storage.
- Use **health checks** (`GET /health`) for load balancer routing.

### Database
- Add **read replicas** for read-heavy workloads (task listing).
- Use **connection pooling** (PgBouncer) when instance count grows.
- Index frequently queried columns (`userId` on tasks is already indexed).

## Caching with Redis

Add Redis for:
- **JWT blocklist** on logout/token revocation.
- **Rate limiting** across multiple API instances (replace in-memory limiter).
- **Task list caching** per user with TTL and cache invalidation on writes.

```
API → Redis (cache) → PostgreSQL (source of truth)
```

## Microservices Migration Path

When modules grow independently, extract them:

| Service      | Responsibility                    |
|-------------|-----------------------------------|
| Auth Service | Registration, login, JWT issuance |
| Task Service | Task CRUD, ownership rules        |
| API Gateway  | Routing, auth validation, rate limiting |

Communication options:
- **Sync**: REST or gRPC between services.
- **Async**: Message queue (RabbitMQ/Kafka) for events like `task.created`.

## Observability

- **Structured logging** (Winston/Pino) with request IDs.
- **Metrics** (Prometheus + Grafana) for latency, error rates, throughput.
- **Distributed tracing** (OpenTelemetry) when running multiple services.

## Deployment

- **Docker Compose** for local/dev (included).
- **Kubernetes** for production: separate Deployments for API and Postgres, ConfigMaps for env vars, Secrets for JWT/database credentials.
- **CI/CD**: GitHub Actions pipeline for lint → test → build → deploy.

## Security at Scale

- Rotate JWT secrets via secrets manager (AWS Secrets Manager, Vault).
- Use HTTPS everywhere; terminate TLS at the load balancer.
- Implement refresh tokens with short-lived access tokens for better security.
- Add WAF rules at the edge for common attack patterns.
