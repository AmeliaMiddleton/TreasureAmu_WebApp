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


---

### 3. Cloudflare Pages — provision the frontend

#### 3a. Set the production API URL

Make sure `frontend/src/environments/environment.prod.ts` points to your Azure App Service URL:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://treasureamu.azurewebsites.net'  // ← your App Service URL
};
```

Commit and push this change to `master`.

#### 3b. Create the Cloudflare Pages project

1. Sign up or log in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. In the sidebar go to **Workers & Pages → Create → Pages → Connect to Git**.
   > Make sure to select **Pages**, not Workers — they are two different products shown as tabs.
3. Authorize Cloudflare to access GitHub, then select the `TreasureAmu_WebApp` repository.
4. Configure the build settings:

   | Setting | Value |
   |---|---|
   | **Production branch** | `master` |
   | **Root directory** | `frontend` |
   | **Build command** | `npx ng build --configuration production` |
   | **Build output directory** | `dist/frontend/browser` |

   > Use `npx ng` not `ng` — the Angular CLI is not installed globally in Cloudflare's build environment.

5. Click **Save and Deploy**. Cloudflare builds and hosts the Angular app. No environment variables are required for the frontend build.
6. Once the first deploy succeeds, Cloudflare assigns a `*.pages.dev` URL. Every subsequent push to `master` that changes files under `frontend/` triggers a new build automatically.

#### 3c. (Optional) Map a custom domain

> ⚠️ **DOCUMENTATION INCOMPLETE** — SSL activation after the nameserver switch is still being resolved. The steps below cover the nameserver changeover but the SSL troubleshooting section is not yet written.

DNS for this project is managed at [Spaceship](https://www.spaceship.com). Cloudflare Pages requires the domain to use Cloudflare's nameservers — a simple CNAME is not enough.

**Step 1 — Add the domain to Cloudflare**

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click your account name → **+ Add button (top right) → Connect a domain**
3. Enter your domain (e.g. `treasureamu.com`) and click **Continue**
4. Select **Import DNS records automatically** and click **Continue**
5. Select the **Free plan**
6. Cloudflare will display your DNS records and give you two nameserver addresses (e.g. `bayan.ns.cloudflare.com` and `rosa.ns.cloudflare.com`)

**Step 2 — Update nameservers at Spaceship**

1. Log in to [Spaceship](https://www.spaceship.com) → your domain → **Nameservers**
2. Replace the existing nameservers with the two Cloudflare nameservers shown in step 1
3. Save the changes
4. Propagation is automatic — it typically completes within 1 hour but can take up to 48 hours

**Step 3 — Configure SSL in Cloudflare**

1. In Cloudflare → **treasureamu.com** → **SSL/TLS → Overview**
2. Set the encryption mode to **Full (Strict)**
3. Go to **SSL/TLS → Edge Certificates** and confirm the certificate status is **Active**

**Step 4 — Add the custom domain to Cloudflare Pages**

1. Go to **Workers & Pages → treasureamu-webapp → Custom domains → Set up a custom domain**
2. Enter your domain — Cloudflare will verify it automatically since it now controls the DNS
3. After the domain is active, update `AllowedOrigins` in `appsettings.Production.json` to include it, then push to redeploy the backend

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
- [ ] SCM Basic Auth Publishing Credentials enabled — Azure Portal → App Service → **Settings → Configuration → General settings** tab → scroll down to **SCM Basic Auth Publishing Credentials** → switch **On** → Save
- [ ] `AZURE_WEBAPP_NAME` and `AZURE_WEBAPP_PUBLISH_PROFILE` GitHub secrets added
- [ ] Azure App Service hostname added to `AllowedHosts` in `appsettings.Production.json`
- [ ] Health endpoint responds: `GET https://<app-name>.azurewebsites.net/api/members/health → { "status": "ok" }`
- [ ] `environment.prod.ts` updated with the correct Azure API URL (`apiBaseUrl`)
- [ ] Cloudflare Pages project created — Pages (not Workers), build command `npx ng build --configuration production`, output `dist/frontend/browser`
- [ ] Cloudflare Pages domain added to `AllowedOrigins` in `appsettings.Production.json`
- [ ] Frontend loads and signup form submits successfully

---

## Production vs Staging vs Development

| | Development (local) | Staging | Production |
|---|---|---|---|
| **Frontend** | `http://localhost:4200` | `https://treasureamu-staging.pages.dev` | `https://treasureamu-webapp.pages.dev` |
| **Backend** | `http://localhost:5000` | `https://treasureamu-staging.azurewebsites.net` | `https://treasureamu.azurewebsites.net` |
| **Database** | Supabase (own project) | Supabase (separate staging project) | Supabase (production project) |
| **Angular env file** | `environment.ts` | `environment.staging.ts` | `environment.prod.ts` |
| **Backend config** | `appsettings.Development.json` | `appsettings.Staging.json` | `appsettings.Production.json` |
| **Backend secrets** | `dotnet user-secrets` | Azure App Settings (staging) | Azure App Settings (production) |
| **Deploy trigger** | Manual | Push to `staging` branch | Push to `master` branch |
| **GitHub Actions workflow** | — | `deploy-backend-staging.yml` | `deploy-backend.yml` |

### Run locally (development)

```bash
# Terminal 1 — backend
cd backend/TreasureAmu.API
dotnet run

# Terminal 2 — frontend
cd frontend
ng serve
```

Open `http://localhost:4200`. The Angular dev proxy forwards `/api/*` to `http://localhost:5000` automatically.

### Deploy to staging

1. Create a staging Azure App Service following the same steps as production.
2. Add these GitHub secrets:

   | Secret name | Value |
   |---|---|
   | `AZURE_STAGING_WEBAPP_NAME` | Staging App Service name (e.g. `treasureamu-staging`) |
   | `AZURE_STAGING_WEBAPP_PUBLISH_PROFILE` | Publish profile XML from the staging App Service |

3. In the staging Azure App Service → **Settings → Environment variables**, add:

   | Name | Value |
   |---|---|
   | `Supabase__Url` | Your **staging** Supabase project URL |
   | `Supabase__AnonKey` | Your **staging** Supabase anon key |
   | `Supabase__ServiceRoleKey` | Your **staging** Supabase service role key |
   | `ASPNETCORE_ENVIRONMENT` | `Staging` |

4. Push to the `staging` branch — `deploy-backend-staging.yml` deploys the backend automatically.
5. Cloudflare Pages automatically creates a preview deployment for the `staging` branch with its own URL.
6. Update `environment.staging.ts` with the staging API URL and the staging Cloudflare preview URL in `appsettings.Staging.json`.

### Deploy to production

Push to `master`. GitHub Actions deploys the backend to Azure; Cloudflare Pages rebuilds and deploys the frontend automatically.

---

### Staging checklist

Use this list when setting up the staging instance from scratch:

- [ ] Staging Supabase project created and both migration files applied
- [ ] Staging Azure App Service created (Linux, .NET 8)
- [ ] SCM Basic Auth Publishing Credentials enabled — Azure Portal → staging App Service → **Settings → Configuration → General settings** tab → scroll down to **SCM Basic Auth Publishing Credentials** → switch **On** → Save
- [ ] Four Azure Application Settings added to staging App Service (`Supabase__Url`, `Supabase__AnonKey`, `Supabase__ServiceRoleKey`, `ASPNETCORE_ENVIRONMENT=Staging`)
- [ ] `AZURE_STAGING_WEBAPP_NAME` and `AZURE_STAGING_WEBAPP_PUBLISH_PROFILE` GitHub secrets added
- [ ] Staging App Service hostname added to `AllowedHosts` in `appsettings.Staging.json`
- [ ] Staging health endpoint responds: `GET https://treasureamu-staging.azurewebsites.net/api/members/health → { "status": "ok" }`
- [ ] `environment.staging.ts` updated with the correct staging API URL
- [ ] Staging Cloudflare Pages preview URL added to `AllowedOrigins` in `appsettings.Staging.json`
- [ ] Staging frontend loads and signup form submits successfully

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
