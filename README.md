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

**In production** on Azure App Service, set these under **Settings → Environment variables** (or **Configuration → Application settings** in older portal versions). Azure maps `__` to `:` in config section names:

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

Follow the steps below **in order** the first time you deploy. After the one-time cloud setup is complete, every push to `master` deploys automatically.

```
Recommended order:
  1. Supabase (database must exist before the API can connect)
  2. Azure App Service (backend API)
  3. Cloudflare Pages (frontend)
```

---

### 1. Supabase — provision the database

1. Sign up or log in at [supabase.com](https://supabase.com).
2. Click **New project**. Choose an organization, give the project a name (e.g. `treasureamu`), set a strong database password, and select the region closest to your users.
3. Wait for the project to finish provisioning (usually 1–2 minutes).
4. Go to **SQL Editor** and run each migration file in order:
   - `database/migrations/001_create_members_table.sql`
   - `database/migrations/002_remove_anon_insert_policy.sql`
5. Go to **Project Settings → API** and copy these three values — you will need them in the next step:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **anon key** (`public` section)
   - **service role key** (`secret` section — treat this like a password)

---

### 2. Azure App Service — provision the backend

#### 2a. Create the App Service

1. Sign in to the [Azure Portal](https://portal.azure.com).
2. Click **Create a resource → Web → Web App**.
3. Fill in the basics:
   - **Subscription** — select your subscription.
   - **Resource Group** — create new (e.g. `treasureamu-rg`).
   - **Name** — this becomes the subdomain, e.g. `treasureamu-api` → `treasureamu-api.azurewebsites.net`. Pick something unique.
   - **Publish** — Code.
   - **Runtime stack** — `.NET 8 (LTS)`.
   - **Operating System** — Linux.
   - **Region** — same region as your Supabase project.
4. Under **App Service Plan**, click **Create new**. The free **F1** tier is enough to start; upgrade to **B1** or higher for production traffic.
5. Click **Review + create → Create** and wait for the deployment to finish.

#### 2b. Add application settings (environment variables)

1. In the Azure Portal → your new App Service → **Settings → Environment variables**.
   > If you don't see "Environment variables", try **Configuration → Application settings** — both paths exist depending on your portal version.
2. Click **Add** for each row below:

   | Name | Value |
   |---|---|
   | `Supabase__Url` | Your Supabase project URL |
   | `Supabase__AnonKey` | Your Supabase anon key |
   | `Supabase__ServiceRoleKey` | Your Supabase service role key |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |

3. Click **Save** at the top of the page. The App Service restarts automatically.

#### 2c. Wire up GitHub Actions for continuous deployment

1. Before downloading the publish profile, enable basic authentication:
   - App Service → **Settings → Configuration → General settings** tab
   - Scroll down to **SCM Basic Auth Publishing Credentials** and switch it **On**
   - Click **Save** and wait for it to apply
2. In the Azure Portal → App Service → **Overview → Download publish profile** → open the downloaded XML file in a text editor.
3. In your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**, create two secrets:

   | Secret name | Value |
   |---|---|
   | `AZURE_WEBAPP_NAME` | The App Service name you chose (e.g. `treasureamu-api`) |
   | `AZURE_WEBAPP_PUBLISH_PROFILE` | Paste the full XML contents of the publish profile file |

4. Push any change to `backend/` on the `master` branch. The workflow at `.github/workflows/deploy-backend.yml` runs automatically: it restores packages, runs tests, and deploys if tests pass.
5. Confirm the deploy succeeded: visit `https://<your-app-name>.azurewebsites.net/api/members/health` — it should return `{ "status": "ok" }`.

#### 2d. (Optional) Map a custom domain

1. In the Azure Portal → App Service → **Custom domains → Add custom domain**.
2. Follow the wizard to add a CNAME or A record in your DNS provider pointing to the App Service.
3. After the domain is verified, update `AllowedHosts` and `AllowedOrigins` in `appsettings.json` to include the new domain, then push to trigger a redeploy.

---

### 3. Cloudflare Pages — provision the frontend

#### 3a. Set the production API URL

Before pushing, make sure `frontend/src/environments/environment.prod.ts` points to your Azure App Service URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://treasureamu-api.azurewebsites.net'  // ← your App Service URL
};
```

Commit and push this change to `master`.

#### 3b. Create the Cloudflare Pages project

1. Sign up or log in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. In the sidebar go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize Cloudflare to access GitHub, then select the `TreasureAmu_WebApp` repository.
4. Configure the build settings:

   | Setting | Value |
   |---|---|
   | **Production branch** | `master` |
   | **Root directory** | `frontend` |
   | **Build command** | `ng build --configuration production` |
   | **Build output directory** | `dist/treasure-amu/browser` |

5. Click **Save and Deploy**. Cloudflare builds and hosts the Angular app. No environment variables are required for the frontend build.
6. Once the first deploy succeeds, Cloudflare assigns a `*.pages.dev` URL. Every subsequent push to `master` triggers a new build automatically.

#### 3c. (Optional) Map a custom domain

1. In the Cloudflare Pages project → **Custom domains → Set up a custom domain**.
2. Enter your domain (e.g. `treasureamu.com`). If your domain's DNS is already managed by Cloudflare, the record is created automatically. Otherwise, add the provided CNAME to your external DNS provider.

---

### 4. Database — apply migrations

Migrations are plain SQL files. Run them manually whenever the schema changes.

**Option A — Supabase Dashboard (no extra tools)**

Paste each file into **Supabase Dashboard → SQL Editor → Run** in order:
1. `database/migrations/001_create_members_table.sql`
2. `database/migrations/002_remove_anon_insert_policy.sql`

**Option B — Supabase CLI**

```bash
# Install the CLI (one-time)
npm install -g supabase

# Log in and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Push all pending migrations
supabase db push
```

Migrations are **not** applied automatically by the CI/CD pipeline.

---

### Deployment checklist

Use this list when setting up a new instance from scratch:

- [ ] Supabase project created and both migration files applied
- [ ] Supabase URL, anon key, and service role key copied
- [ ] Azure App Service created (Linux, .NET 8)
- [ ] Four Azure Application Settings added (`Supabase__Url`, `Supabase__AnonKey`, `Supabase__ServiceRoleKey`, `ASPNETCORE_ENVIRONMENT`)
- [ ] `AZURE_WEBAPP_NAME` and `AZURE_WEBAPP_PUBLISH_PROFILE` GitHub secrets added
- [ ] Health endpoint responds: `GET /api/members/health → { "status": "ok" }`
- [ ] `environment.prod.ts` updated with the correct Azure API URL and committed
- [ ] Cloudflare Pages project created with correct root directory and build command
- [ ] Frontend loads and can submit the signup form successfully

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
