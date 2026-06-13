# Connect TaskFlow to Supabase (PostgreSQL)

Supabase **is PostgreSQL** — it fully satisfies the assignment requirement for a Postgres/MySQL/MongoDB database. Prisma works with it the same way as any PostgreSQL host.

## Important: two different ways to connect to Supabase

| What you have | Used for | Works with this project? |
|---------------|----------|---------------------------|
| `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (or anon key) | Supabase JS client / REST API | **No** — this backend uses Prisma, not the Supabase SDK |
| `DATABASE_URL` + `DIRECT_URL` (PostgreSQL URI) | Prisma, direct SQL | **Yes** — this is what you need |

Your project URL `https://xxxxx.supabase.co` confirms the project exists, but you still must copy the **Database connection strings** from the dashboard (see Step 2 below).

> **Security:** Never commit API secret keys or database passwords to GitHub. If you shared a secret key in chat, rotate it in Supabase → **Project Settings → API**.

## Existing Supabase project / different schema?

**Yes, you can reuse the same Supabase project.** This app does not use Supabase Auth tables (`auth.users`). It creates its own tables:

- `users` — email, password hash, name, role
- `tasks` — title, description, status, userId

When you run `npx prisma db push`, Prisma will create or update these tables to match `prisma/schema.prisma`.

- If those tables **don't exist yet** → they will be created. Safe.
- If they **already exist with the same names but different columns** → `db push` may alter them or error. Check **Table Editor** first.
- Supabase built-in **Authentication** tables live in the `auth` schema — they won't conflict with our `public.users` table.

Your Express API, JWT auth, and React frontend stay the same; only the database host changes from SQLite/local to Supabase.

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **New project**.
3. Choose an organization, name (e.g. `taskflow`), database password, and region.
4. **Save the database password** — you need it for connection strings.

Wait until the project status is **Active** (1–2 minutes).

## Step 2 — Get connection strings

1. Open your project in Supabase.
2. Go to **Project Settings** (gear icon) → **Database**.
3. Scroll to **Connection string** → choose **URI**.

You need **two** URLs:

| Variable | Supabase tab | Port | Used for |
|----------|--------------|------|----------|
| `DATABASE_URL` | **Transaction pooler** (or Session pooler) | 6543 | App runtime (recommended) |
| `DIRECT_URL` | **Direct connection** | 5432 | `prisma db push` / migrations |

Replace `[YOUR-PASSWORD]` with your database password.

**Example** (your values will differ):

```env
DATABASE_URL="postgresql://postgres.abcdefgh:MyStr0ngP@ss@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdefgh:MyStr0ngP@ss@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

> If your password contains special characters (`@`, `#`, `%`, etc.), [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) them in the connection string.

## Step 3 — Update `backend/.env`

Copy from `.env.example` and paste your Supabase URLs:

```powershell
cd backend
copy .env.example .env
# Edit .env and replace DATABASE_URL + DIRECT_URL with your Supabase strings
```

Keep your other variables:

```env
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

## Step 4 — Push schema to Supabase

From the `backend` folder:

```powershell
npm install
npx prisma generate
npx prisma db push
```

This creates the `users` and `tasks` tables in your Supabase database.

Optional — view data in Supabase:

- **Table Editor** in the Supabase dashboard shows `users` and `tasks`.

## Step 5 — Run the app

```powershell
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open http://localhost:5173 → **Register** a new account (User or Admin).

## Step 6 — Verify connection

1. **Health**: http://localhost:3001/health  
2. **Register** a user in the app.  
3. In Supabase → **Table Editor** → `users` — you should see the new row.

## Production / deployment notes

When deploying the backend (Render, Railway, Fly.io, etc.):

1. Set `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and `CORS_ORIGIN` as environment variables (use your **frontend production URL** for `CORS_ORIGIN`).
2. Run `npx prisma db push` once during deploy (or in CI) to sync schema.
3. Do **not** commit `.env` to GitHub — only `.env.example`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Can't reach database server` | Check project is Active; verify host, password, and region in URI |
| `prepared statement already exists` | Use pooler URL with `?pgbouncer=true` for `DATABASE_URL` |
| `Migration / db push fails` | Use `DIRECT_URL` (port 5432), not the pooler URL |
| Auth works locally but not deployed | Set `CORS_ORIGIN` to your live frontend URL |
| SSL errors | Add `?sslmode=require` to the connection string if needed |

## Why two URLs?

- **Pooler (6543)**: Better for a running API (many connections, serverless-friendly).
- **Direct (5432)**: Required for Prisma schema changes (`db push`, `migrate`).

Both point to the same Supabase PostgreSQL database.
