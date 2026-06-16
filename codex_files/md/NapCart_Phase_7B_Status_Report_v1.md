# NapCart Phase 7B Status Report v1

Version: v1.0
Date: 2026-06-16
Status: In progress - local readiness verified, production deployment not yet validated
Owner: Naptime AI
Product: NapCart

---

## 1. Current Phase 7B Position

Phase 7B is the production readiness and first-restaurant launch preparation phase.

This report records evidence from the current worktree and connected services. It should be used together with:

- `NapCart_Phase_7B_Production_Readiness_Checklist_v1.md`
- `NapCart_First_Restaurant_Onboarding_SOP_v1.md`
- `NapCart_Loom_Demo_Runbook_SmogyIce_v1.md`

Notion update:

- Standalone private status page created: `NapCart Phase 7B Status Update - 2026-06-16`
- URL: `https://app.notion.com/p/3810d469f18c81cfa2e3e3c10eb6d91f`

---

## 2. Local Quality Gate Evidence

All local code quality gates passed on 2026-06-16.

| Gate | Result | Evidence |
|---|---:|---|
| Local env presence check | Passed | Required local keys are present in `apps/web/.env.local`; no placeholder detected. |
| `npm run lint` | Passed | ESLint completed with exit code 0. |
| `npm run typecheck` | Passed | TypeScript completed with exit code 0. |
| `npm run build` | Passed | Next.js production build completed successfully. |

Latest build evidence:

- Next.js `16.2.6`
- Production build compiled successfully.
- TypeScript completed successfully.
- Static generation completed for `21/21` pages.
- Admin, storefront, order API, mock WhatsApp action API, and Meta webhook routes were included in the build output.

---

## 3. Local Runtime Route Evidence

Local server checked at `http://localhost:3000`.

| Route | Expected | Result |
|---|---|---|
| `/login` | Public login page loads | `200 OK` |
| `/admin` | Redirect unauthenticated users to login | `307` to `/login` |
| `/storefront/smogyice-demo` | Smogy Ice storefront loads | `200 OK` |
| `/storefront/smogyice-demo/menu` | Smogy Ice menu page loads | `200 OK` |
| `/storefront/smogyice-demo/checkout` | Checkout page loads | `200 OK` |
| `/api/storefront/smogyice-demo` | Public storefront API returns menu data | Passed |
| `/api/webhooks/whatsapp/meta` with bare GET/HEAD | Reject invalid webhook request | `400 Bad Request` |

Storefront API confirmed:

- Restaurant: `Smogy Ice`
- Slug: `smogyice-demo`
- Currency: `PKR`
- Timezone: `Asia/Karachi`
- Branch data present
- Product/category data present
- Variant/add-on data present
- Delivery zones present

---

## 4. Order Engine And Mock WhatsApp Evidence

One Phase 7B QA order was placed through the real storefront API.

| Field | Value |
|---|---|
| Order number | `NC-260616084649-MYIY` |
| Restaurant | `Smogy Ice` |
| Branch | `Wapda Town` |
| Fulfillment | `delivery` |
| Initial status | `pending_confirmation` |
| Grand total | `PKR 670` |

Verified behavior:

- Guest checkout created the order successfully with HTTP `201`.
- Order started as `PENDING_CONFIRMATION`.
- Outbound mock WhatsApp staff notification log was created.
- Mock confirm action returned HTTP `200`.
- Order final status became `CONFIRMED`.
- Status history contains `PENDING_CONFIRMATION -> CONFIRMED`.
- Customer confirmation notification log was created.
- Duplicate confirm action is safe and returns `changed: false`.
- Opposite cancel action after confirmed is rejected with HTTP `400`.
- Live Supabase read confirmed the stored restaurant, branch, customer snapshot, linked customer record, PKR totals, order status history, and WhatsApp message logs.

Latest confirmed database values:

| Field | Verified value |
|---|---|
| Stored restaurant | `Smogy Ice` / `smogyice-demo` |
| Stored branch | `Wapda Town` |
| Stored status | `CONFIRMED` |
| Payment method | `CASH_ON_DELIVERY` |
| Payment status | `UNPAID` |
| WhatsApp provider | `MOCK` |
| Customer order count | `2` |
| Status source | `WHATSAPP_STAFF_ACTION` |

Relevant log types observed:

- `new_order_staff_notification`
- `mock_staff_order_action`
- `customer_order_confirmed_notification`

Relevant log statuses observed:

- `SENT`
- `PROCESSED`
- `SENT`

---

## 5. Vercel Readiness Evidence

Connected Vercel account status:

- Team: `Naptime AI's projects`
- Team ID: `team_1dO3j810esfLIt4UOmtng9TO`
- Project: `napcart`
- Project ID: `prj_uitm0DTlNRF65pPAkT7RrWeAYPev`

Deployment status from connected Vercel project:

| Deployment | Target | State | Commit message |
|---|---|---|---|
| `dpl_CphTR5z3iSZNminVmSLjzs4AJCfw` | production | `ERROR` | `feat: complete phase 2 admin configuration experience` |
| `dpl_AANhX13C5s3dLcSyFr7vYqf6iP2P` | production | `ERROR` | `feat: complete phase 1 data and auth foundations` |
| `dpl_3hvmwUStVxwiVEpTggEuYa5ry6Z2` | production | `READY` | `chore: load prisma env from local overrides` |

Interpretation:

- Vercel connection is valid.
- The `napcart` project exists under the correct team.
- Current latest production deployment is not healthy.
- The current local worktree has not yet been validated on Vercel production/preview.
- Phase 7B cannot be marked complete until a current deployment is built and verified, or deployment validation is explicitly deferred.

---

## 6. Demo Readiness

The local Loom/demo path is mostly ready.

Verified locally:

- Smogy Ice storefront loads.
- Menu and checkout pages load.
- Storefront API returns real Smogy Ice catalog data.
- Order can be placed.
- Order status can be confirmed through mock WhatsApp action flow.
- Provider/message logs are created.
- Supabase data confirms the QA order is stored as confirmed with status history and provider logs.
- Real admin login flow works for the Smogy Ice tenant.
- Authenticated `/admin` loads successfully after login redirect.
- Authenticated `/admin/orders` includes the QA order `NC-260616084649-MYIY`.
- Authenticated `/admin/orders/NC-260616084649-MYIY` renders the order detail with confirmed status, Wapda Town branch, NapCart QA Demo customer snapshot, and WhatsApp-related content.

Tooling limitation:

- The in-app browser automation refused `localhost` navigation because of its URL policy.
- To avoid overstating evidence, authenticated admin verification was completed through the real HTML login flow and session-backed HTTP requests instead of the blocked browser tool.

Still recommended before client-facing recording:

- Manual visual pass on storefront desktop/mobile.
- Manual visual pass on admin dashboard/orders screens for presentation polish.

Demo admin accounts from seed defaults:

- General demo: `owner@demo.napcart.local`
- Smogy Ice demo: `owner@smogyice.napcart.local`

Passwords are managed through the seed/env setup and should not be published in shared docs.

---

## 7. Remaining Phase 7B Blockers

Phase 7B is not complete yet.

Remaining required work:

1. Deploy or promote the current code to Vercel preview/production.
2. Verify Vercel deployment routes after deployment.
3. Verify production/preview env variables are complete.
4. Perform a final manual visual pass for Loom/demo polish.
5. Get user approval before marking Phase 7B complete or moving to final client-facing Loom recording.

---

## 8. Current Recommendation

Do not record the client-facing Loom from production yet.

Recommended next move:

1. Use local environment today for a controlled internal Loom dry run.
2. Perform Vercel deployment validation next.
3. After production/preview is healthy, record the final Loom for Smogy Ice management.
