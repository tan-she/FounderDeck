# FounderDeck

A founder-investor matchmaking platform where entrepreneurs publish pitches, investors signal intent, and promising conversations become private collaborations.

Think LinkedIn meets Product Hunt — with real-time voting, AI-assisted pitch writing, and encrypted direct messaging gated behind mutual collaboration requests.

---

## Features

- **Pitch Feed** — Browse, filter, and search startup pitches by industry, funding stage, and trending score
- **Multi-intent Voting** — Signal interest as Upvote, Downvote, Seeking Co-Founder, Looking to Invest, or Need Advisor
- **AI Pitch Enhancement** — DeepSeek-powered description and one-liner summary generation inside the pitch editor
- **Collaboration Requests** — Investors send gated requests; entrepreneurs accept or reject before messaging unlocks
- **Private Messaging** — Real-time encrypted direct messaging via Laravel Reverb WebSockets
- **Live Notifications** — Push notifications for votes, comments, collab requests, and messages
- **Bookmarks** — Save pitches for later across sessions
- **Public Profiles** — Founder profiles with LinkedIn credential sync and verification badges
- **Role System** — Separate dashboards and permissions for Entrepreneurs, Investors, and Super Admins
- **Google OAuth** — One-click sign-up and login via Google
- **Admin Dashboard** — Ban/unban users, delete posts and comments, review community reports, view platform analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.3 |
| Database | PostgreSQL 15 |
| Auth | Laravel Sanctum, Laravel Socialite (Google OAuth) |
| WebSockets | Laravel Reverb |
| AI | DeepSeek via HuggingFace API |
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 3, shadcn/ui |
| State | Zustand 5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP | Axios |
| Routing | React Router 7 |
| Toasts | Sonner |
| Deployment | Render (API) + Vercel (Web) |

---

## Project Structure

```
FounderDeck/
├── founderdeck-api/      # Laravel 13 backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # Route controllers
│   │   │   ├── Middleware/        # Role & profile guards
│   │   │   ├── Requests/          # Form request validation
│   │   │   └── Resources/         # JSON response transformers
│   │   ├── Models/                # Eloquent models
│   │   ├── Events/                # Broadcast events (Reverb)
│   │   ├── Mail/                  # Queued email templates
│   │   ├── Policies/              # Authorization policies
│   │   └── Services/              # DeepSeek AI service
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
├── founderdeck-web/      # React 19 frontend
│   └── src/
│       ├── api/           # Axios wrappers (auth, posts)
│       ├── components/    # Shared UI + layout guards
│       ├── config/        # API URL config
│       ├── lib/           # Formatters and utilities
│       ├── pages/
│       │   ├── admin/     # Admin dashboard pages
│       │   ├── auth/      # Login, Register, OAuth callback, Onboarding
│       │   ├── entrepreneur/  # Entrepreneur dashboard
│       │   ├── investor/      # Investor dashboard
│       │   ├── public/        # Landing, Pitch Feed, Pitch Detail, Public Profile
│       │   └── shared/        # Messages, Notifications
│       └── store/         # Zustand stores (auth, chat, notifications)
│
├── LOCAL_SETUP.md        # Full local dev setup guide
├── render.yaml           # Render production deployment config
└── README.md
```

---

## Quick Start

For a complete step-by-step guide including prerequisites, environment variables, and daily workflow, see **[LOCAL_SETUP.md](LOCAL_SETUP.md)**.

**TL;DR:**

```bash
# 1. Backend
cd founderdeck-api
cp .env.example .env        # fill in DB_PASSWORD, GOOGLE_CLIENT_ID/SECRET
./setup-backend.sh

# 2. Frontend
cd ../founderdeck-web
cp .env.example .env.local  # set VITE_API_URL=http://localhost:8000
./setup-frontend.sh

# 3. Run (5 terminals)
cd founderdeck-api && php artisan serve --port=8000
cd founderdeck-api && php artisan queue:work --tries=3
cd founderdeck-api && php artisan reverb:start --port=8080
cd founderdeck-api && php artisan schedule:work
cd founderdeck-web  && npm run dev
```

App will be live at **http://localhost:5173**. Log in with `admin@founderdeck.com`.

---

## Environment Variables

### Backend (`founderdeck-api/.env`)

| Variable | Description |
|---|---|
| `APP_KEY` | Laravel app key — run `php artisan key:generate` |
| `DB_CONNECTION` | `pgsql` for production, `sqlite` for local testing |
| `DB_PASSWORD` | PostgreSQL password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Frontend origin (e.g. `http://localhost:5173`) |
| `REVERB_APP_KEY` | WebSocket app key (any string for local) |
| `SUPER_ADMIN_EMAIL` | Email for the seeded admin account |
| `SUPER_ADMIN_PASSWORD` | Password for the seeded admin account |
| `HUGGINGFACE_API_KEY` | HuggingFace API key for DeepSeek AI features |

### Frontend (`founderdeck-web/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `http://localhost:8000`) |
| `VITE_REVERB_KEY` | Must match `REVERB_APP_KEY` in backend `.env` |
| `VITE_REVERB_HOST` | Reverb host (default: `localhost`) |
| `VITE_REVERB_PORT` | Reverb port (default: `8080`) |

---

## Deployment

### Backend — [Render](https://render.com)

Configured via `render.yaml`. Render automatically provisions a PostgreSQL database and runs migrations on deploy.

```
Build:  composer install --no-dev --optimize-autoloader
Start:  php artisan migrate --force && php artisan config:cache && php artisan serve ...
```

### Frontend — [Vercel](https://vercel.com)

Configured via `founderdeck-web/vercel.json`. Set `VITE_API_URL` to your Render backend URL in Vercel project settings.

---

## API Overview

All endpoints are prefixed with `/api`.

| Domain | Endpoints |
|---|---|
| Auth | Register, Login, Logout, Me, Google OAuth |
| Posts | CRUD, paginated feed with search/filter/sort |
| Comments | Create, Edit, Delete per post |
| Votes | Multi-intent voting (up/down/cofounder/invest/advisor) |
| Bookmarks | Toggle bookmark per post |
| Collaboration | Send, accept, reject, withdraw requests |
| Messages | Conversations list, thread, send, mark read |
| Notifications | List, mark one read, mark all read, unread count |
| Profile | View public profile, update own profile, LinkedIn sync |
| Reports | Submit report on post or comment |
| AI | Enhance pitch description and generate one-liner |
| Admin | Stats, user management, post/comment deletion, report review |

---

## Roles

| Role | Access |
|---|---|
| `entrepreneur` | Publish and manage pitches, receive collab requests, messaging |
| `investor` | Browse pitches, send collab requests, messaging |
| `super_admin` | Full admin dashboard — all of the above plus moderation tools |
