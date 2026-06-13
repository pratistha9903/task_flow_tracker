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

## Deploy frontend on Render (Static Site)

The frontend must know your **live backend URL** at build time.

### Render → New Static Site → connect repo

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Environment variable (required before build)

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` |

No trailing slash. Must include `/api/v1`.

After adding/changing `VITE_API_URL`, **redeploy** the frontend (rebuild required).

---

## Fix "Failed to fetch" on login/register

This almost always means the browser cannot reach your API. Check these **three** things:

### 1. Frontend points to Render backend (not localhost)

Open browser DevTools → Network tab → try login → see which URL is called.

- Bad: `http://localhost:3001/api/v1/auth/login`
- Good: `https://your-backend.onrender.com/api/v1/auth/login`

**Fix:** Set `VITE_API_URL` on the **frontend** Render service and redeploy.

### 2. Backend CORS allows your frontend URL

On **backend** Render → Environment:

```
CORS_ORIGIN=https://your-frontend.onrender.com
```

For local + production together:

```
CORS_ORIGIN=http://localhost:5173,https://your-frontend.onrender.com
```

Redeploy backend after changing.

### 3. Backend is actually running

Open in browser:

```
https://your-backend.onrender.com/health
```

Should return: `{"success":true,"message":"API is running"}`

If this fails, fix backend deploy first (see database section above).

---

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
