# NapCart Phase 7B Current Checkpoint

Date: 2026-06-17
Status: Fresh Smogy Ice Supabase setup complete; Vercel naming/domain decision needed

## Current Objective

Complete Phase 7B up to the point where the user needs to add environment variables in Vercel.

## Locked Decisions

- Use fresh infrastructure for Smogy Ice.
- Do not use the existing Supabase project named `Smogy Ice`; it belongs to a different purpose.
- Create a new Supabase project named `NapCart Smogy Ice`.
- Use Supabase region `ap-south-1`.
- Target URLs:
  - Storefront: `smogyice.vercel.app`
  - Admin: `admin.smogyice.vercel.app`
- Preserve the internal NapCart demo environment and seeded demo login.
- Do not damage the Smogy Ice storefront UI or NapCart admin UI.

## Completed Locally

- Updated project planning docs for the restaurant-specific production model.
- Added deployment-mode routing support:
  - `NEXT_PUBLIC_NAPCART_DEPLOYMENT_MODE=core|admin|storefront`
  - `NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG=smogyice-demo`
- Added clean storefront routes for storefront deployments:
  - `/`
  - `/menu`
  - `/checkout`
  - `/order-success/[orderNumber]`
- Preserved legacy/core demo routes:
  - `/storefront/smogyice-demo`
  - `/storefront/smogyice-demo/menu`
  - `/storefront/smogyice-demo/checkout`
- Added deployment-aware metadata:
  - Core: NapCart
  - Admin: Smogy Ice Admin
  - Storefront: Smogy Ice
- Verification passed:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

## Connector Status

Codex app MCP connectors are currently failing with internal errors:

- Supabase MCP: failing
- Vercel MCP: failing
- GitHub MCP: failing
- Notion MCP: failing

CLI fallbacks:

- GitHub CLI: working as `naptimeai`
- Vercel CLI: working as `naptimeai`
- Vercel team available: `naptime-ais-projects`
- Supabase CLI: working with local access token stored in ignored `codex_files/secrets.md`

## Fresh Smogy Ice Supabase Setup

- Created fresh Supabase project:
  - Name: `NapCart Smogy Ice`
  - Project ref: `qtbsxqenmgtfgprvbfeq`
  - Region: `ap-south-1`
  - Status: active/healthy
- Stored generated Supabase project secrets in ignored local file:
  - `codex_files/secrets.md`
- Applied Prisma schema to the fresh database.
- Seeded Smogy Ice-only data using `SEED_TARGET=smogyice`:
  - Restaurant slug: `smogyice-demo`
  - Branches: `wapda-town`, `dha-phase-8`, `walton-road`, `sheikhupura`
  - Products: `140`
  - Admin email: `owner@smogyice.napcart.local`
- Updated seed safety:
  - Explicit environment variables now override local `.env.local`.
  - Smogy production seeding no longer inserts the generic NapCart demo restaurant into the fresh client database.

## Verification Passed After Fresh DB Setup

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Current Vercel Decision Needed

The Vercel team already has an existing project named `smogyice` using:

- `https://smogyice.vercel.app`

The user said not to use existing Smogy Ice projects. Therefore, do not touch, rename, remove, or reuse the existing `smogyice` Vercel project without explicit approval.

The requested target URL `smogyice.vercel.app` cannot be assigned to a new separate Vercel project while the existing `smogyice` project owns it.

Decision required before creating Vercel projects:

1. Rename/remove the old unrelated `smogyice` Vercel project, then create the new NapCart-backed `smogyice` project.
2. Use a new project name/default URL such as `smogyice-napcart.vercel.app` or `smogyice-ordering.vercel.app`.
3. Keep the old `smogyice` project and attach a separate custom domain later.

## Next Step After Vercel Decision

1. Create/prepare Vercel projects for:
   - Smogy Ice storefront
   - Smogy Ice admin/backend
2. Prepare exact Vercel environment variable list for production/preview.
3. Stop when exact Vercel environment variables are ready for the user to enter.

## Important Safety Note

Do not use the existing Supabase project named `Smogy Ice`.
It was briefly restored during investigation, then paused again after the user clarified it is unrelated.

## 2026-06-17 Deployment Completion Update

- Fresh Vercel projects are live:
  - Storefront project: `smogyice`
  - Admin project: `smogyice-admin`
- GitHub repository mapping is configured:
  - Storefront project uses the fresh private repo `naptimeai/smogyice`.
  - Admin project uses the main NapCart repo `naptimeai/napcart`.
- Vercel project settings are configured:
  - `smogyice` framework preset: `Next.js`
  - `smogyice-admin` framework preset: `Next.js`
  - `smogyice-admin` root directory: `apps/web`
- Restaurant-specific branding is deployment-driven through environment variables:
  - `NEXT_PUBLIC_CLIENT_NAME`
  - `NEXT_PUBLIC_CLIENT_DESCRIPTION`
  - `NEXT_PUBLIC_CLIENT_ICON_PATH`
- Added `apps/web/vercel.json` with `framework: nextjs` so fresh Vercel projects deploy the app as Next.js, not static/Other.
- Production deployments verified:
  - Storefront: `https://smogyice.vercel.app` returns HTTP 200.
  - Admin login: `https://smogyice-admin.vercel.app/login` returns HTTP 200.
- Storefront API verified against the fresh Smogy Supabase database:
  - Restaurant slug: `smogyice-demo`
  - Branches: `4`
  - Categories: `8`
- Deployed order-flow smoke test passed:
  - Order number: `NC-260617035257-QJ9O`
  - Branch: `Wapda Town`
  - Grand total: `PKR 540`
  - Status: `pending_confirmation`
- Local verification passed before deployment:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

## Current Production URLs

- Storefront: `https://smogyice.vercel.app`
- Admin: `https://smogyice-admin.vercel.app/login`

## Admin Login

- Email: `owner@smogyice.napcart.local`
- Password is stored locally in ignored `codex_files/secrets.md` / seed default reference.
