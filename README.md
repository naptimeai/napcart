# NapCart

NapCart is a reusable restaurant ordering and delivery automation platform by Naptime AI.

This repository is the main application codebase for the MVP described in:

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

## Local Setup Status

This repository currently includes:

- Next.js application foundation
- Tailwind CSS setup
- Prisma foundation
- base environment template
- shared product constants for NapCart launch defaults

## Planned Next Steps

1. Create and connect the remote project foundations:
   - GitHub
   - Supabase
   - Vercel
2. Translate the approved ERD into the real Prisma schema.
3. Implement admin auth and tenant/restaurant scoping.

## Scripts

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
- Do not introduce scope outside the approved MVP without updating the planning artifacts first.
