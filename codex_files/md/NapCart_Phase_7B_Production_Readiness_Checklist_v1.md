# NapCart Phase 7B Production Readiness Checklist v1

Version: v1.0
Date: 2026-06-16
Status: Active execution checklist
Owner: Naptime AI
Product: NapCart

---

## 1. Phase 7B Goal

Phase 7B prepares NapCart for a professional first-restaurant demo and production deployment path.

The goal is not only to make the app run locally. The goal is to prove that NapCart can be safely reviewed, deployed, configured, and demonstrated for a real restaurant without confusing the agreed MVP scope.

Approved production direction for this phase:

- NapCart remains the internal product core
- Smogy Ice is packaged as the first restaurant-specific deployment
- real restaurant launches should use separate production infrastructure, not permanent client branches

---

## 2. MVP Scope Guardrails

These rules must not change during Phase 7B unless explicitly approved.

- Staff operations remain WhatsApp-first.
- Admin dashboard is owner/management-facing.
- Orders are created as `Pending Confirmation`.
- Staff can only confirm or cancel orders through WhatsApp or the mock WhatsApp action flow.
- Admin can view orders, customers, status history, and provider logs.
- Admin must not delete orders in MVP.
- Admin must not be treated as the normal staff confirmation console.
- Customer notifications are limited to order confirmed and order cancelled.
- No online payments in MVP.
- No customer accounts in MVP.
- No rider tracking in MVP.
- Real Meta WhatsApp API can be connected later through the adapter layer.

---

## 3. Environment Readiness

### 3.0 Deployment Model

Required:

- [ ] NapCart core/testing environment remains available for internal development and QA.
- [ ] Smogy Ice uses a dedicated production deployment target.
- [ ] Smogy Ice uses a dedicated Supabase project.
- [ ] Restaurant-facing URLs use Smogy Ice branding, not generic NapCart public URLs.
- [ ] Custom storefront and admin/backend deployment mapping is documented.

### 3.1 Local Development

Required:

- [ ] `apps/web/.env.local` exists.
- [ ] `apps/web/.env` exists if needed for local fallback.
- [ ] `DATABASE_URL` points to the intended Supabase database.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is configured.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is configured.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured server-side only.
- [ ] `WHATSAPP_PROVIDER=mock` for demo/testing unless live Meta credentials are approved.
- [ ] `WHATSAPP_MOCK_ACTION_SECRET` is configured.

Evidence:

- Local route checks return expected status codes.
- Lint, typecheck, and build pass.

### 3.2 Vercel Preview

Required:

- [ ] Preview deployment strategy is defined for the restaurant-facing stack.
- [ ] Preview environment variables are configured.
- [ ] Preview deployment builds successfully.
- [ ] Preview storefront URL loads.
- [ ] Preview admin login loads.
- [ ] Preview admin auth works.
- [ ] Preview order placement works.
- [ ] Preview mock WhatsApp logs are created.

Evidence:

- Preview deployment URL.
- Test order number.
- Screenshot or Loom clip.

### 3.3 Vercel Production

Required:

- [ ] Dedicated Vercel project exists for Smogy Ice production.
- [ ] Production environment variables are configured.
- [ ] Production deployment builds successfully.
- [ ] Production URL loads.
- [ ] Production admin login loads.
- [ ] Production admin auth works.
- [ ] Production storefront loads.
- [ ] Production checkout works with demo restaurant data.
- [ ] Production mock WhatsApp flow works or live Meta flow is explicitly configured.

Evidence:

- Production deployment URL.
- Test order number.
- Provider/message log record.

---

## 4. Supabase Readiness

Required:

- [ ] Dedicated Smogy Ice Supabase project is active.
- [ ] Database schema matches Prisma schema.
- [ ] Required migrations are applied.
- [ ] Smogy Ice-only production seed/config data exists.
- [ ] Smogy Ice restaurant record exists.
- [ ] Smogy Ice branches exist.
- [ ] Smogy Ice categories/products/variants/add-ons exist.
- [ ] Delivery zones exist for demo branch coverage.
- [ ] Admin user exists and is mapped in `admin_users`.
- [ ] Storage setup supports restaurant logos and product images if used in the demo.

Evidence:

- Prisma build succeeds.
- Admin dashboard renders Smogy/admin data.
- Storefront API returns Smogy menu data.

---

## 5. Functional QA Checklist

### 5.1 Storefront

- [ ] Home page loads.
- [ ] Menu page loads.
- [ ] Product cards display correct names/prices.
- [ ] Cart opens and updates quantity.
- [ ] Delivery and pickup modes are available.
- [ ] Branch selection works.
- [ ] Checkout step 1 validates required customer fields.
- [ ] Checkout review step displays correct summary.
- [ ] Order success page displays order number and details.
- [ ] Mobile layout remains usable.

### 5.2 Order Engine

- [ ] Guest checkout creates or reuses customer by normalized phone.
- [ ] Order stores customer name and phone snapshots.
- [ ] Order stores product/variant/add-on snapshots.
- [ ] Delivery fee is applied from configured rules.
- [ ] Pickup order does not require delivery address.
- [ ] Delivery order requires address.
- [ ] Order starts as `Pending Confirmation`.
- [ ] Status history records initial system event.

### 5.3 WhatsApp Mock / Provider Layer

- [ ] New order creates outbound branch WhatsApp log.
- [ ] Mock message contains complete structured order details.
- [ ] Mock confirm action changes status to `Confirmed`.
- [ ] Mock cancel action changes status to `Cancelled`.
- [ ] Duplicate same final action is handled safely.
- [ ] Opposite final action after final state is rejected.
- [ ] Customer notification contract/log is recorded.
- [ ] Provider logs are visible in order detail.

### 5.4 Admin

- [ ] Admin login works.
- [ ] Admin dashboard loads.
- [ ] Orders list loads.
- [ ] Order detail page loads.
- [ ] Customer list loads.
- [ ] Catalog overview loads.
- [ ] Categories page loads.
- [ ] Products page loads.
- [ ] Branches page loads.
- [ ] Branches delivery page loads.
- [ ] Delivery zones page loads.
- [ ] Settings page loads.
- [ ] Admin cannot access another restaurant's data.
- [ ] Admin pages redirect to login when unauthenticated.

---

## 6. Security and Data Safety

Required:

- [ ] Service role key is never exposed client-side.
- [ ] Admin routes require authenticated admin session.
- [ ] Admin queries are restaurant-scoped.
- [ ] Storefront APIs only expose public restaurant/menu data.
- [ ] WhatsApp tokens/secrets are server-side only.
- [ ] Order deletion is not exposed in MVP admin.
- [ ] Product/category deletion does not destroy historical order snapshots.
- [ ] Production logs must not print full secrets.

---

## 7. Loom Demo Readiness

Required before recording:

- [ ] Local server or deployed URL is stable.
- [ ] Browser has clean tabs ready.
- [ ] Admin account credentials are known.
- [ ] Smogy storefront opens on the intended restaurant-facing deployment.
- [ ] Cart and checkout are tested once before recording.
- [ ] Admin Orders page is tested once before recording.
- [ ] Mock WhatsApp confirm/cancel link or provider log path is ready.
- [ ] Demo order data does not expose private secrets.
- [ ] Restaurant-facing URLs do not expose generic NapCart branding unless intentionally shown as internal tooling.

Recommended Loom flow:

1. Open Smogy Ice storefront.
2. Show branded homepage and menu.
3. Add one product with variation/add-on if available.
4. Open cart and proceed to checkout.
5. Fill guest customer details.
6. Review order.
7. Place order.
8. Show order success page.
9. Open NapCart admin.
10. Show order list and new order.
11. Open order detail.
12. Show customer/order/items/status history/provider logs.
13. Trigger mock confirm or explain Meta adapter readiness.
14. Show final status update.

---

## 8. Phase 7B Exit Criteria

Phase 7B can be considered complete when:

- [ ] Local quality checks pass.
- [ ] Production readiness checklist is complete or clearly marked with approved deferrals.
- [ ] First restaurant onboarding SOP exists.
- [ ] Demo/Loom path is verified end-to-end.
- [ ] Restaurant-specific production deployment is validated.
- [ ] Restaurant-specific Supabase project is validated.
- [ ] Open launch risks are documented.
- [ ] User approves moving to live Meta WhatsApp API testing or client handoff.
