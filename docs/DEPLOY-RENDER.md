# Deploy Backend on Render + Supabase

## Why deploy fails with `P1001: Can't reach database server`

Supabase **direct** URLs look like:

```
db.xxxxx.supabase.co:5432
```

That host is **IPv6-only** on the free tier. **Render uses IPv4**, so it cannot connect → `P1001`.

This is **not** a wrong password — it's a **network** issue.

---

## Fix: use Supabase **pooler** URLs on Render

In **Render → your service → Environment**, set:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | **Transaction pooler** — port **6543** + `?pgbouncer=true` |
| `DIRECT_URL` | **Session pooler** — port **5432** on `pooler.supabase.com` (NOT `db.xxx.supabase.co`) |

### Where to copy from Supabase

**Connect** button (top) or **Settings → Database → Connection string → URI**

1. **Transaction pooler** → `DATABASE_URL`
2. **Session pooler** → `DIRECT_URL` (for Render; IPv4-compatible)

### Example (replace password & region)

```env
DATABASE_URL=postgresql://postgres.vyyhxlwjvpbqdmlafrzq:Pratistha%402002@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.vyyhxlwjvpbqdmlafrzq:Pratistha%402002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

> Encode `@` in passwords as `%40`. On Render, `PORT` is often `10000` (Render sets `PORT` automatically — you can omit it).

---

## Render service settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm start` |

**Do NOT** run `npx prisma db push` on Render — run it **once locally** before deploying:

```powershell
cd backend
npx prisma db push
```

---

## Checklist before redeploy

- [ ] `DATABASE_URL` uses **pooler** host + port **6543** + `?pgbouncer=true`
- [ ] `DIRECT_URL` uses **session pooler** (`pooler.supabase.com:5432`), **not** `db.xxx.supabase.co`
- [ ] Password is URL-encoded (`@` → `%40`)
- [ ] `JWT_SECRET` is set on Render
- [ ] `CORS_ORIGIN` matches your frontend URL
- [ ] Tables already created via local `npx prisma db push`
- [ ] Start command is `npm start` (not `prisma db push && ...`)

---

## Supabase project not paused

Free-tier Supabase projects **pause after inactivity**. Open the Supabase dashboard and ensure the project status is **Active** before deploying.
