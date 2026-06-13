# TaskFlow — Task Management System

A full-stack task management platform built for the **Backend Developer Intern** assignment. It includes a scalable REST API with JWT authentication, role-based access control (User / Admin), PostgreSQL on Supabase, and a React frontend with admin analytics.

**Live repo:** [github.com/pratistha9903/task-flow](https://github.com/pratistha9903/task-flow)

---

## Features

### Backend
- User registration & login with **bcrypt** password hashing
- **JWT** authentication with protected routes
- **Role-based access** — `USER` (own tasks) vs `ADMIN` (all tasks + analytics)
- Full **CRUD** REST API for tasks
- **Admin analytics API** — org-wide stats, per-user progress, recent activity
- API versioning (`/api/v1`)
- Input validation, sanitization & centralized error handling
- **Swagger** documentation at `/api/docs`
- **PostgreSQL** via **Supabase** + Prisma ORM
- Rate limiting & security headers (Helmet)

### Frontend
- Premium UI with sidebar layout (**TaskFlow** branding)
- Register with **User** or **Admin** role selection
- Protected dashboard (JWT required)
- **User dashboard** — personal tasks, filters, one-click **Done** button
- **Admin dashboard** — analytics board, person-wise progress tracker, all-tasks table
- Quick **Done | Edit | Delete** actions on every task
- Success/error toasts from API responses

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (Supabase) + Prisma |
| Auth     | JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite |
| Docs     | Swagger UI, Postman collection |
| DevOps   | Docker Compose (optional) |

---

## Project Structure

```
task-management/
├── backend/
│   ├── src/
│   │   ├── config/           # App config, DB, Swagger
│   │   ├── middleware/       # Auth, validation, errors
│   │   ├── modules/
│   │   │   ├── auth/         # Register, login, profile
│   │   │   ├── tasks/        # Task CRUD
│   │   │   └── analytics/    # Admin analytics (ADMIN only)
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── prisma/               # Schema & migrations
├── frontend/
│   └── src/
│       ├── api/              # API client
│       ├── context/          # Auth context
│       ├── pages/            # Login, Register, User/Admin dashboards
│       └── components/       # Layout, TaskForm, progress tracker
├── docs/
│   ├── SUPABASE.md           # Supabase connection guide
│   ├── SCALABILITY.md        # Scaling notes
│   └── postman-collection.json
└── docker-compose.yml
```

---

## Prerequisites

- **Node.js 20+**
- **npm**
- Free [Supabase](https://supabase.com) account (PostgreSQL hosting)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/pratistha9903/task-flow.git
cd task-flow
```

### 2. Set up Supabase (PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy two URLs:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Direct connection** (port `5432`) → `DIRECT_URL`

> **Important:** If your password contains `@`, encode it as `%40`. Add `?pgbouncer=true` to `DATABASE_URL`.

Full step-by-step guide: [docs/SUPABASE.md](docs/SUPABASE.md)

### 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@....pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@....pooler.supabase.com:5432/postgres"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### 4. Install & push database schema

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 5. Run the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 6. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/health |

Register at http://localhost:5173/register and choose **User** or **Admin**.

---

## Roles

| Role | Capabilities |
|------|-------------|
| **USER** | Create, view, edit, delete own tasks; personal progress tracker |
| **ADMIN** | All of the above + view/edit/delete **all users' tasks**; analytics dashboard; person-wise team progress |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register (body: `email`, `password`, `name`, `role`) |
| POST | `/api/v1/auth/login` | No | Login |
| GET | `/api/v1/auth/profile` | Yes | Current user profile |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tasks` | Yes | List tasks (own for USER, all for ADMIN) |
| GET | `/api/v1/tasks/:id` | Yes | Get task by ID |
| POST | `/api/v1/tasks` | Yes | Create task |
| PUT | `/api/v1/tasks/:id` | Yes | Update task |
| DELETE | `/api/v1/tasks/:id` | Yes | Delete task |

### Analytics (Admin only)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/analytics` | Admin | Dashboard stats, per-user progress, recent activity |
| GET | `/api/v1/analytics/users` | Admin | List all users with task counts |

---

## API Documentation

- **Swagger UI:** http://localhost:3001/api/docs (with backend running)
- **Postman:** Import [docs/postman-collection.json](docs/postman-collection.json)

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooler URL (port 6543) + `?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct URL (port 5432) for Prisma migrations |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default: `24h`) |
| `PORT` | Backend port (default: `3001`) |
| `CORS_ORIGIN` | Frontend URL (default: `http://localhost:5173`) |

Never commit `.env` to Git — use `.env.example` as a template.

---

## Database Schema

**Users:** `id`, `email`, `password`, `name`, `role` (USER | ADMIN)

**Tasks:** `id`, `title`, `description`, `status` (TODO | IN_PROGRESS | DONE), `userId`

Managed with Prisma — see [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

---

## Scalability

See [docs/SCALABILITY.md](docs/SCALABILITY.md) for notes on horizontal scaling, Redis caching, microservices migration, and deployment.

## Deploy on Render

If deploy fails with **`P1001: Can't reach database server`**, you are likely using Supabase's direct URL (`db.xxx.supabase.co:5432`) which is **IPv6-only**. Render uses **IPv4** and cannot reach it.

**Full fix:** [docs/DEPLOY-RENDER.md](docs/DEPLOY-RENDER.md)

| Render env var | Use on Render |
|----------------|---------------|
| `DATABASE_URL` | Transaction pooler, port **6543**, add `?pgbouncer=true` |
| `DIRECT_URL` | Session pooler, port **5432** on `pooler.supabase.com` (not `db.xxx.supabase.co`) |

Run `npx prisma db push` **locally once**. On Render use **Start Command:** `npm start`.

---

## Assignment Deliverables Checklist

| Deliverable | Status |
|-------------|--------|
| Backend on GitHub with README | ✅ |
| Working auth & CRUD APIs | ✅ |
| React frontend connected to APIs | ✅ |
| Swagger + Postman documentation | ✅ |
| PostgreSQL database (Supabase) | ✅ |
| Scalability note | ✅ |
| Role-based access (User / Admin) | ✅ |
| Admin analytics dashboard | ✅ |

---

## Optional: Docker (local PostgreSQL)

```bash
docker compose up -d postgres
# Set DATABASE_URL and DIRECT_URL to local Postgres in backend/.env
cd backend && npx prisma db push && npm run dev
```

---

## License

MIT
