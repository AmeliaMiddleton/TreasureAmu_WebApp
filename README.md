# TreasureAmu WebApp

Landing page and membership signup for **TreasureAmu** — a neighborhood listing community where neighbors help each other sell items online, together.

A **Geekamu Business** · [Amy@geekamu.com](mailto:Amy@geekamu.com)

---

## Architecture

```
Browser
  └── Angular SPA (Cloudflare Pages)
        └── HTTPS  ──► .NET 8 Web API (Azure App Service)
                            └── Supabase REST API (PostgreSQL)
```

| Layer    | Technology                          | Hosting              |
|----------|-------------------------------------|----------------------|
| Frontend | Angular 21 (standalone components)  | Cloudflare Pages     |
| Backend  | C# ASP.NET Core 8 Web API           | Azure App Service    |
| Database | Supabase (PostgreSQL + RLS)         | Supabase cloud       |
| Styling  | SCSS with 5 WCAG 2.1 AA themes      | —                    |
| CI/CD    | GitHub Actions                      | Deploys backend only |

---

## Project Structure

```
TreasureAmu_WebApp/
├── .github/
│   └── workflows/
│       └── deploy-backend.yml   GitHub Actions — test + deploy API to Azure
├── frontend/
│   ├── public/
│   │   └── _redirects           Cloudflare Pages SPA routing rule
│   └── src/
│       ├── theme.config.ts      All 5 themes configured here
│       ├── environments/        API URL (dev: localhost:5000, prod: Azure URL)
│       └── app/
│           ├── core/            Models + services
│           ├── features/        Landing page component
│           └── shared/          Theme switcher component
├── backend/
│   └── TreasureAmu.API/
│       ├── Controllers/         MembersController (signup + health)
│       ├── Models/              Member, SignupRequest, SignupResponse
│       ├── Services/            MemberService (Supabase REST client)
│       ├── Data/                SupabaseConfig
│       ├── appsettings.json              Dev/default config (no secrets)
│       ├── appsettings.Development.json  Debug log levels only
│       └── appsettings.Production.json   Production overrides (no secrets)
└── database/
    └── migrations/
        ├── 001_create_members_table.sql   Schema + RLS policies
        └── 002_remove_anon_insert_policy.sql  Security hardening
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS or later | [nodejs.org](https://nodejs.org) |
| Angular CLI | 18+ | `npm install -g @angular/cli` |
| .NET SDK | 8.0 | [dot.net](https://dotnet.microsoft.com/download/dotnet/8.0) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/AmeliaMiddleton/TreasureAmu_WebApp.git
cd TreasureAmu_WebApp
```

### 2. Supabase — create the database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run each migration in order:
   - `database/migrations/001_create_members_table.sql`
   - `database/migrations/002_remove_anon_insert_policy.sql`
3. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **anon key** (public key, needed by config but not directly used by the API)
   - **service role key** (secret — the API uses this to bypass RLS)

### 3. Backend — C# API

```bash
cd backend/TreasureAmu.API

# Store Supabase credentials as .NET user secrets (never commit real keys)
dotnet user-secrets set "Supabase:Url"            "https://YOUR_PROJECT_ID.supabase.co"
dotnet user-secrets set "Supabase:AnonKey"        "YOUR_ANON_KEY"
dotnet user-secrets set "Supabase:ServiceRoleKey" "YOUR_SERVICE_ROLE_KEY"

# Restore packages and run
dotnet restore
dotnet run
```

The API is available at `http://localhost:5000`.
Swagger UI is available at `http://localhost:5000/swagger` (development only).

```
GET  /api/members/health   →  { "status": "ok" }
POST /api/members/signup   →  register a member or newsletter subscriber
```

### 4. Frontend — Angular

```bash
cd frontend
npm install
ng serve
```

The app is available at `http://localhost:4200`.
The Angular dev proxy is pre-configured to forward `/api/*` calls to `http://localhost:5000`.

---

## Configuration Reference

### Backend — `appsettings.json`

All values in this file are safe defaults or placeholders. **Never put real credentials here.**

| Key | Purpose | Example |
|-----|---------|---------|
| `AllowedHosts` | Semicolon-separated list of accepted `Host` headers | `localhost;api.treasureamu.com` |
| `AllowedOrigins` | Array of origins permitted by CORS | `["https://treasureamu.com"]` |
| `Supabase:Url` | Supabase project REST URL | `https://abc.supabase.co` |
| `Supabase:AnonKey` | Supabase public anon key | `eyJ...` |
| `Supabase:ServiceRoleKey` | Supabase service role key (**secret**) | `eyJ...` |

**In development** use `dotnet user-secrets` (see above) — secrets are stored outside the repo in `%APPDATA%\Microsoft\UserSecrets\`.

**In production** on Azure App Service, set these as **Application Settings** (environment variables). Azure maps `__` to `:` in config section names:

| Azure App Setting name | Maps to config key |
|---|---|
| `Supabase__Url` | `Supabase:Url` |
| `Supabase__AnonKey` | `Supabase:AnonKey` |
| `Supabase__ServiceRoleKey` | `Supabase:ServiceRoleKey` |

### Frontend — `environments/`

| File | Used when |
|---|---|
| `environment.ts` | `ng serve` (development) |
| `environment.prod.ts` | `ng build --configuration production` |

Set `apiUrl` in `environment.prod.ts` to your Azure App Service URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://treasureamu-api.azurewebsites.net'
};
```

---

## Deployment

### Frontend — Cloudflare Pages

1. Push the repo to GitHub (Cloudflare watches the `main` branch).
2. In the Cloudflare Dashboard → **Pages → Create application → Connect to Git**:
   - **Build command:** `ng build --configuration production`
   - **Build output directory:** `frontend/dist/treasure-amu/browser`
   - **Root directory:** `frontend`
3. The `frontend/public/_redirects` file is already in the repo and handles Angular client-side routing (`/* /index.html 200`).

No secrets or environment variables are needed for the frontend build.

### Backend — Azure App Service (automated via GitHub Actions)

The CI/CD pipeline in `.github/workflows/deploy-backend.yml` triggers automatically on every push to `main` that changes files under `backend/`.

**One-time setup:**

1. Create an Azure App Service (Linux, .NET 8).
2. In the Azure Portal → App Service → **Overview → Get publish profile** → download the XML file.
3. In GitHub → **Settings → Secrets and variables → Actions**, create two secrets:

   | Secret name | Value |
   |---|---|
   | `AZURE_WEBAPP_NAME` | Your App Service name (e.g. `treasureamu-api`) |
   | `AZURE_WEBAPP_PUBLISH_PROFILE` | Paste the full XML contents of the publish profile |

4. In Azure App Service → **Configuration → Application Settings**, add:

   | Name | Value |
   |---|---|
   | `Supabase__Url` | Your Supabase project URL |
   | `Supabase__AnonKey` | Your Supabase anon key |
   | `Supabase__ServiceRoleKey` | Your Supabase service role key |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |

After these are configured, every push to `main` runs the test suite and then deploys if tests pass.

### Database — Supabase migrations

Migrations are plain SQL files run manually in the Supabase SQL Editor (or via the Supabase CLI). They are not automatically applied by the CI/CD pipeline.

```bash
# With Supabase CLI (optional)
supabase db push
```

Or paste each file in **Supabase Dashboard → SQL Editor → Run**.

---

## Themes

Open `frontend/src/theme.config.ts` to change the default theme:

```typescript
export const DEFAULT_THEME_ID = 'warm-harvest'; // ← change this
```

| ID | Name | Style |
|---|---|---|
| `treasure-gold` | Treasure Gold | Dark, brand-matching gold |
| `warm-harvest` | Warm Harvest | Cream + deep amber (default) |
| `ocean-mist` | Ocean Mist | Clean blue-gray, professional |
| `forest-canopy` | Forest Canopy | Natural sage green |
| `sunset-violet` | Sunset Violet | Soft lavender + deep purple |

All themes meet **WCAG 2.1 AA** contrast requirements (4.5:1 body, 3:1 large text).

---

## Accessibility

- WCAG 2.1 AA contrast on all 5 themes
- Skip navigation link (keyboard users)
- Persistent `aria-live` regions for form success and error announcements
- `aria-required`, `aria-invalid`, `aria-describedby` on all form fields
- Programmatic focus management after form submission
- Semantic landmarks: `header`, `main`, `nav`, `footer`, `section`
- `role="list"` on Safari/VoiceOver list-style:none elements
- `forced-colors` / Windows High Contrast support
- `prefers-reduced-motion` respected

---

## API Security

- **CORS**: Explicit origin/method/header whitelist — no wildcards
- **Rate limiting**: 5 signup attempts per IP per minute (HTTP 429 on breach)
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- **HSTS**: Enabled in production
- **Host header protection**: `AllowedHosts` set to explicit domain list
- **Input validation**: `[Required]`, `[MaxLength]`, `[EmailAddress]`, `[RegularExpression]` on all fields
- **RLS**: Supabase Row Level Security — only the service role key can write
- **Secrets**: Never in source control; stored as Azure App Settings in production, `dotnet user-secrets` in development

---

## Running Tests

```bash
# Backend
cd backend
dotnet test --configuration Release

# Frontend (unit tests)
cd frontend
ng test

# Frontend (end-to-end with Playwright)
cd frontend
npx playwright test
```

---

*Built with care for the TreasureAmu community.*
