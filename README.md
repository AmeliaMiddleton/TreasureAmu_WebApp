# TreasureAmu WebApp

Landing page for **TreasureAmu** — a neighborhood listing community where neighbors help each other sell items online, together.

A **Geekamu Business** · Contact: Amy@geekamu.com

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Angular 21 (standalone components) |
| Backend  | C# ASP.NET Core 8 Web API         |
| Database | Supabase (PostgreSQL)             |
| Styling  | SCSS with 5 ADA-compliant themes  |

---

## Project Structure

```
TreasureAmu_WebApp/
├── frontend/               Angular landing page
│   └── src/
│       ├── theme.config.ts   ← All 5 themes configured here
│       ├── environments/     ← API URL config (dev/prod)
│       └── app/
│           ├── core/         ← Models + services
│           ├── features/     ← Landing page component
│           └── shared/       ← Theme switcher component
├── backend/
│   └── TreasureAmu.API/    C# API project
│       ├── Controllers/      ← MembersController
│       ├── Models/           ← Member, SignupRequest/Response
│       ├── Services/         ← MemberService (Supabase REST)
│       └── Data/             ← SupabaseConfig
└── database/
    └── migrations/
        └── 001_create_members_table.sql
```

---

## Getting Started

### 1. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `database/migrations/001_create_members_table.sql`
3. Copy your **Project URL**, **anon key**, and **service role key** from Project Settings → API

### 2. Backend (C# API)

```bash
cd backend/TreasureAmu.API

# Store secrets securely (never commit real keys)
dotnet user-secrets set "Supabase:Url" "https://YOUR_PROJECT_ID.supabase.co"
dotnet user-secrets set "Supabase:AnonKey" "YOUR_ANON_KEY"
dotnet user-secrets set "Supabase:ServiceRoleKey" "YOUR_SERVICE_ROLE_KEY"

# Run the API (available at http://localhost:5000)
dotnet run

# Swagger UI available at: http://localhost:5000/swagger
```

### 3. Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (available at http://localhost:4200)
ng serve
```

The frontend is pre-configured to proxy API calls to `http://localhost:5000`.

---

## Changing the Default Theme

Open `frontend/src/theme.config.ts` and change:

```typescript
export const DEFAULT_THEME_ID = 'warm-harvest'; // ← change this
```

Available themes:

| ID               | Name           | Style                         |
|------------------|----------------|-------------------------------|
| `treasure-gold`  | Treasure Gold  | Dark, brand-matching gold     |
| `warm-harvest`   | Warm Harvest   | Cream + deep amber (default)  |
| `ocean-mist`     | Ocean Mist     | Clean blue-gray, professional |
| `forest-canopy`  | Forest Canopy  | Natural sage green            |
| `sunset-violet`  | Sunset Violet  | Soft lavender + deep purple   |

All themes meet **WCAG 2.1 AA** contrast requirements (4.5:1 for normal text, 3:1 for large text).

---

## ADA / Accessibility Features

- ✅ WCAG 2.1 AA contrast on all 5 themes
- ✅ Skip navigation link for keyboard users
- ✅ Proper ARIA labels, roles, and `aria-live` regions
- ✅ Visible focus indicators (3px ring, keyboard-only via `:focus-visible`)
- ✅ Form error messages linked via `aria-describedby`
- ✅ Semantic HTML (landmarks: `header`, `main`, `nav`, `footer`, `section`)
- ✅ Respects `prefers-reduced-motion`
- ✅ `forced-colors` (Windows High Contrast) support
- ✅ `aria-invalid` and `role="alert"` on form errors

---

## Pushing to GitHub

```bash
cd TreasureAmu_WebApp

# Initialize git
git init
git add .
git commit -m "Initial commit: TreasureAmu landing page with Angular + C# API + Supabase"

# Create the GitHub repo and push (requires GitHub CLI)
gh repo create TreasureAmu_WebApp --public --source=. --remote=origin --push

# Or manually:
# git remote add origin https://github.com/YOUR_USERNAME/TreasureAmu_WebApp.git
# git branch -M main
# git push -u origin main
```

---

## Production Build

```bash
# Angular production build
cd frontend
ng build --configuration production

# Serve the dist/ folder with any static host (Vercel, Netlify, GitHub Pages, etc.)
```

---

*Built with ❤️ for the TreasureAmu community.*
