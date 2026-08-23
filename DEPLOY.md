# Deploy Estate Manager

## Stack

- **Frontend:** React (Vite) — static host (Render Static / Vercel / Netlify)
- **Backend:** NestJS + Prisma — Docker web service
- **Database:** PostgreSQL

## Option A — Render (recommended)

Free tier note: the API uses a **Node** runtime (not Docker). Docker on Render requires a paid plan.

1. Push this repo to GitHub.
2. Open [Render Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance** → select this repo (`render.yaml`).
3. If a previous sync failed on Docker, delete that Blueprint and create a new one (or Manual Sync after this fix).
4. After the API is live, copy its URL (e.g. `https://estate-manager-api.onrender.com`).
5. In **estate-manager-web** env: set `VITE_API_URL` to that API URL.
6. In **estate-manager-api** env: set `CORS_ORIGIN` to the frontend URL.
7. In **estate-manager-api** env: set `PUBLIC_APP_URL` to the frontend URL (used for WhatsApp/Facebook/Instagram campaign landing links, e.g. `https://estate-manager-web.onrender.com`).
8. Optional AI marketing: set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, `OPENAI_IMAGE_MODEL`) on the API to enable caption + image generation in Marketing.
9. Redeploy both services.

Free Postgres expires after 30 days unless upgraded.

## Option B — Docker Compose (VPS)

```bash
cd infra
docker compose up -d --build
```

- App: http://localhost:8080  
- API: http://localhost:3000  

Change `JWT_SECRET`, passwords, and `VITE_API_URL` / `CORS_ORIGIN` for a real domain.

## Local development

```bash
# DB
cd infra && docker compose up -d postgres

# API
cd backend/estate-manager-api
cp .env.example .env   # edit DATABASE_URL / JWT_SECRET
yarn install
npx prisma migrate deploy
yarn start:dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```
