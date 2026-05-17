# FounderDeck Web

React + Vite frontend for FounderDeck.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set:

```bash
VITE_API_URL=http://localhost:8000
```

The app automatically appends `/api`, so production should use the Render service origin, not the `/api` URL.

## Vercel deployment

This folder includes `vercel.json` for SPA rewrites.

Use these Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-render-service.onrender.com`

After Vercel gives you the frontend URL, update the Render backend env vars:

```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```
