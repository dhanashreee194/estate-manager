# Deploy Estate Manager

## Stack

- **Frontend:** React (Vite) — static host (Render Static / Vercel / Netlify)
- **Backend:** NestJS + Prisma — Docker web service
- **Database:** PostgreSQL

## Option A — Render (recommended)

1. Push this repo to GitHub.
2. Open [Render Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance** → select this repo.
3. After the API is live, copy its URL (e.g. `https://estate-manager-api.onrender.com`).
4. In **estate-manager-web** env: set `VITE_API_URL` to that API URL.
5. In **estate-manager-api** env: set `CORS_ORIGIN` to the frontend URL.
6. Redeploy both services.

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
