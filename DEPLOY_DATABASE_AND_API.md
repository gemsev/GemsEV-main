# Deploy Database and API (Required for Login/Gallery)

Your frontend is deployed, but features like login, gallery, owners, admin, and dashboard require the backend API and Postgres database.

## 1) Create a Postgres database

Use Neon/Supabase/Railway Postgres and copy the connection string:

- `DATABASE_URL=postgres://...`

## 2) Deploy backend (`artifacts/api-server`)

Deploy `artifacts/api-server` to a Node host (Railway/Render/Fly/etc).

Required backend env vars:

- `DATABASE_URL`
- `SESSION_SECRET` (long random string)
- `NODE_ENV=production`
- `PORT` (provided automatically by host in most platforms)

## 3) Run DB schema push and seed once

From repo root (with `DATABASE_URL` set):

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed
```

Seed creates sample users:

- Admin: `username=admin`, `password=admin123`
- Members: `rahulkumar`, `priyasharma`, `amitpatel`, `sunitareddy`, `vikramnair` with password `owner123`

## 4) Point frontend to backend API

In Vercel (frontend project), set:

- `VITE_API_BASE_URL=https://<your-api-domain>`

Then redeploy frontend.

## 5) Verify

- `GET https://<api-domain>/api/healthz` returns healthy response
- Frontend login works with seeded credentials
- Gallery loads items

