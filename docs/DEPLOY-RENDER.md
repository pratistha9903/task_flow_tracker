# Render deployment — read this first

Your **backend** environment variables (screenshot) are correct for the API service.
The login error happens because the **frontend does not read those variables** — it needs its own API URL config.

You need **TWO** services on Render:

| Service type | Example name | URL you open in browser |
|--------------|--------------|-------------------------|
| **Web Service** (backend) | `task-flow-api` | `https://task-flow-api.onrender.com` |
| **Static Site** (frontend) | `task-flow-tracker-main` | `https://task-flow-tracker-main.onrender.com` |

---

## Step 1 — Backend Web Service (you already have this)

### Environment variables (on BACKEND only)

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Supabase transaction pooler `:6543?pgbouncer=true` |
| `DIRECT_URL` | Supabase session pooler `:5432` on `pooler.supabase.com` |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `24h` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `http://localhost:5173,https://task-flow-tracker-main.onrender.com` |

**Delete `PORT` from Render** — Render sets `PORT` automatically. Your app reads `process.env.PORT`.

### Render backend settings

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |

### Test backend (use YOUR backend URL)

```
https://YOUR-BACKEND.onrender.com/health
→ {"success":true,"message":"API is running"}

https://YOUR-BACKEND.onrender.com/
→ {"success":true,"message":"TaskFlow API",...}
```

If you see `Route not found` on `/health`, you are on the **frontend** URL, not the backend.

---

## Step 2 — Connect frontend to backend (THIS FIXES LOGIN)

Edit this file in your repo:

**`frontend/public/app-config.js`**

```javascript
window.APP_CONFIG = {
  API_URL: 'https://YOUR-BACKEND.onrender.com/api/v1',
};
```

Replace `YOUR-BACKEND.onrender.com` with your **backend Web Service** URL (from Render dashboard → backend service → top of page).

Push to GitHub → Render redeploys frontend automatically.

---

## Step 3 — Frontend Static Site settings

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Optional (instead of app-config.js): set `VITE_API_URL` in frontend Environment and redeploy.

---

## Checklist

- [ ] Two Render services: backend (Web) + frontend (Static)
- [ ] `/health` works on **backend** URL
- [ ] `frontend/public/app-config.js` has correct backend URL + `/api/v1`
- [ ] `CORS_ORIGIN` on backend includes frontend URL
- [ ] Removed manual `PORT` from backend env
- [ ] Redeployed both services after changes

---

## Local dev with Render backend

Create `frontend/.env`:

```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api/v1
```

Restart `npm run dev`. Backend `CORS_ORIGIN` must include `http://localhost:5173`.
