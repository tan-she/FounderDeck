# FounderDeck Local Development Setup

Follow this guide to get FounderDeck running locally on your machine.

## SECTION 1 — Prerequisites checklist

Ensure you have the following installed on your machine before starting:
- [ ] PHP 8.2+ installed (`php --version`)
- [ ] Composer installed (`composer --version`)
- [ ] Node 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] PostgreSQL 15+ running locally
- [ ] Git configured

## SECTION 2 — One-time setup

**Step 1:** Clone or open the repo in your code editor.
**Step 2:** Run the structure cleanup script from the root to remove any stray files:
```bash
./fix-structure.sh
```
**Step 3:** Set up the backend environment. Open `FounderDeck/.env` and fill in any required variables:
- `DB_PASSWORD`: Your local PostgreSQL password.
- `GOOGLE_CLIENT_ID` & `SECRET`: Get from [Google Cloud Console](https://console.cloud.google.com).
**Step 4:** Set up the frontend environment by ensuring `founderdeck-web/.env.local` exists.
**Step 5:** Run the backend setup script:
```bash
cd FounderDeck
./setup-backend.sh
cd ..
```
**Step 6:** Run the frontend setup script:
```bash
cd founderdeck-web
./setup-frontend.sh
cd ..
```
**Step 7:** Start all 5 necessary processes (see daily workflow below).

## SECTION 3 — Daily dev workflow

Whenever you open the project to work, you need 5 terminal tabs running simultaneously:

- **Tab 1:** Run Laravel API Server
  ```bash
  cd FounderDeck
  php artisan serve --port=8000
  ```
- **Tab 2:** Run Queue Worker (for emails & jobs)
  ```bash
  cd FounderDeck
  php artisan queue:work --tries=3
  ```
- **Tab 3:** Run Reverb WebSocket Server (for real-time chat/notifications)
  ```bash
  cd FounderDeck
  php artisan reverb:start --port=8080
  ```
- **Tab 4:** Run Scheduler
  ```bash
  cd FounderDeck
  php artisan schedule:work
  ```
- **Tab 5:** Run React Vite Dev Server
  ```bash
  cd founderdeck-web
  npm run dev
  ```

## SECTION 4 — Verify everything is working

- [ ] http://127.0.0.1:8000/api/health returns `{"status":"ok"}`
- [ ] http://localhost:5173 loads the landing page without console errors
- [ ] Login with `admin@founderdeck.com` works and redirects to `/admin/dashboard`
- [ ] WebSocket connects (no errors in browser console about Reverb connection)
- [ ] Creating a test pitch and upvoting shows real-time notification

## SECTION 5 — Common errors and fixes

- **"SQLSTATE: Connection refused"** → PostgreSQL not running or incorrect credentials in `FounderDeck/.env`.
- **"Class not found"** → run `composer dump-autoload` inside `FounderDeck/`.
- **"Vite manifest not found"** → `npm run build` or `npm run dev` must be running in `founderdeck-web/`.
- **"419 CSRF token mismatch"** → Ensure `SANCTUM_STATEFUL_DOMAINS` in Laravel `.env` matches your frontend URL.
- **"403 on broadcast auth"** → Check `REVERB_APP_KEY` matches in both `.env` and `.env.local`.
- **"Port 8000 already in use"** → `lsof -ti:8000 | xargs kill` (Mac/Linux).
- **"Port 8080 already in use"** → `lsof -ti:8080 | xargs kill` (Mac/Linux).

## SECTION 6 — Environment variable quick reference table

| Variable | File | Example Value | How to get it |
|---|---|---|---|
| APP_KEY | FounderDeck/.env | base64:xyz... | Run `php artisan key:generate` |
| DB_PASSWORD | FounderDeck/.env | my_db_pass | Your local PG password |
| REVERB_APP_KEY | FounderDeck/.env | founderdeck_local_key | Leave as default for local |
| GOOGLE_CLIENT_ID | FounderDeck/.env | 123...apps.googleusercontent.com | Google Cloud Console > API & Services |
| GOOGLE_CLIENT_SECRET | FounderDeck/.env | GOCSPX-... | Google Cloud Console > API & Services |
| SUPER_ADMIN_EMAIL | FounderDeck/.env | admin@founderdeck.com | Any email you want for admin login |
| SUPER_ADMIN_PASSWORD| FounderDeck/.env | password | Any password you want |
| VITE_API_URL | founderdeck-web/.env.local | http://localhost:8000 | The URL where Laravel is running |
| VITE_REVERB_KEY | founderdeck-web/.env.local | founderdeck_local_key | Must match REVERB_APP_KEY |
