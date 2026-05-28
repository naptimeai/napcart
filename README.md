# NapCart

NapCart is a reusable restaurant ordering and delivery automation platform by Naptime AI.

## Repository Layout

This workspace is intentionally split so product artifacts and application code stay separate:

- `docs/`
  - official readable PDF deliverables only
- `codex_files/`
  - working markdown, HTML exports, and internal source artifacts
- `apps/web/`
  - the actual Next.js application for NapCart

## Product Documents

The approved planning and design artifacts for the MVP are stored as PDFs in `docs/`:

- `docs/NapCart_Project_Roadmap.pdf`
- `docs/NapCart_PRD_v1.pdf`
- `docs/NapCart_ERD_v1.pdf`
- `docs/NapCart_Architecture_Spec_v1.pdf`
- `docs/NapCart_Implementation_Plan_v1.pdf`

## Current Phase

The project is currently in `Phase 0: Project Setup and Delivery Foundations`.

## Approved Core Direction

- single codebase
- Next.js + TypeScript
- PostgreSQL + Prisma
- Supabase for database, auth, and storage
- Vercel deployment
- Pakistan-first defaults for initial launch
- WhatsApp-first restaurant operations

## Working With The App

All application commands should be run from `apps/web/`.

```bash
cd apps/web
npm run dev
```

Available scripts inside `apps/web/`:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run lint:fix`
- `npm run typecheck`
- `npm run format`
- `npm run format:check`
- `npm run prisma:generate`
- `npm run db:push`
- `npm run db:migrate`
- `npm run db:studio`

## Notes

- Keep `docs/` reserved for official PDFs only.
- Keep working/source artifacts in `codex_files/`.
- Keep product/application code inside `apps/`.
- Do not introduce scope outside the approved MVP without updating the planning artifacts first.
