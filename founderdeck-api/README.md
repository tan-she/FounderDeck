# FounderDeck API

Laravel backend for an entrepreneur networking and collaboration platform.

## Features

- Sanctum token auth for founders, investors, and super admins
- Founder pitch posts with tags, tech stack, links, votes, comments, and views
- Investor upvotes/downvotes and collaboration requests
- Encrypted one-to-one messages stored through Laravel encryption
- Notifications for upvotes, comments, collab requests, collab status, and messages
- Admin stats, user moderation, post moderation, and report review

## Local setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=SuperAdminSeeder
php artisan serve --host 127.0.0.1 --port 8000
```

Set `FRONTEND_URL=http://localhost:5173` and keep `CORS_ALLOWED_ORIGINS` aligned with your frontend origin.

## Render deployment

The repository root includes `render.yaml` for a Render Blueprint with a PHP web service and PostgreSQL database.

Important production env vars:

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-render-service.onrender.com
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
DB_CONNECTION=pgsql
DB_URL=<Render PostgreSQL connection string>
QUEUE_CONNECTION=database
MAIL_MAILER=log
```

After deployment, run the super admin seeder once from Render Shell if you need admin access:

```bash
php artisan db:seed --class=SuperAdminSeeder
```

Change the seeded admin password immediately before real use.
