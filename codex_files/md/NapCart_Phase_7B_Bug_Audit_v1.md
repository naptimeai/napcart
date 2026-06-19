# NapCart Phase 7B Bug Audit v1

Version: v1.0
Date: 2026-06-18
Status: Fixing in progress
Product: NapCart
Client demo stack: Smogy Ice

## 1. Purpose

This document is the single source of truth for the Phase 7B stabilization bug audit before fixing begins.

Current rule:

- Do not fix issues during this discovery pass.
- Record reported and discovered issues first.
- Prioritize issues after discovery.
- Fix issues in controlled batches after approval.
- Keep Smogy Ice storefront UI and admin UI intact unless the issue specifically requires a UI correction.

## 2. Scope

Audit scope:

- Smogy Ice admin panel
- Smogy Ice storefront
- Order flow
- Catalog workflows
- Product workflows
- Branch workflows
- Delivery zone workflows
- Filters, pagination, CTAs, and status controls
- Restaurant-specific theming and demo polish

Out of scope for this audit:

- Real Meta WhatsApp Cloud API connection
- Online payments
- Customer login/OTP
- Rider management
- Coupons/loyalty

## 3. User-Reported Issues

| ID | Area | Issue | Priority | Status |
|---|---|---|---|---|
| BUG-U01 | Admin Orders | Orders page stat-card icons and icon backgrounds use multiple colors instead of Smogy Ice primary theme color. | P2 | Fixed |
| BUG-U02 | Admin Order Detail | `Provider Logs` stat card icon is orange and should match Smogy Ice primary icon color. | P2 | Fixed |
| BUG-U03 | Admin Orders | `View detail` CTA wraps onto two lines in the Orders Register rows; it should stay on one line. | P2 | Fixed |
| BUG-U04 | Admin Orders | Orders Register type filter and `Apply` button positioning leaves awkward empty space; controls should align toward the right side. | P2 | Fixed |
| BUG-U05 | Catalog Overview | `Draft Changes` stat-card icon is orange instead of Smogy Ice primary color. Need also review whether this card has real MVP purpose. | P2 | Fixed |
| BUG-U06 | Catalog Products | Product page summary-card icons use different colors; should use Smogy Ice primary color consistently. | P2 | Fixed |
| BUG-U07 | Catalog Products | Product list pagination is not fully functional. | P1 | Fixed |
| BUG-U08 | Catalog Products | `Show [n] per page` selector is not functional. | P1 | Fixed |
| BUG-U09 | Product Edit Flow | Editing an existing product still shows creation-flow CTAs like `Continue to Availability`; changes should expose a clear `Save changes` behavior per edit step. | P1 | Fixed |
| BUG-U10 | Admin Filters | Filters across multiple admin pages need verification and must work accurately. | P1 | Fixed for audited pages |
| BUG-U11 | Catalog Settings | Catalog settings contains questionable/non-working sections such as branch/delivery settings, tax, catalog behavior, and notifications. Need reassess what belongs here for MVP. | P1 | Fixed |
| BUG-U12 | Branches | New branch creation is not working. | P0 | Fixed |
| BUG-U13 | Storefront Branch Availability | Temporary branch closure is bypassed by test-mode message, allowing orders even when branch is closed. | P0 | Fixed |
| BUG-U14 | Delivery Zones | New delivery zone appears after creation but disappears after refresh/edit attempt, suggesting persistence or read/query issue. | P0 | Fixed |
| BUG-U15 | Delivery Zones | Branch quick selector on branch-specific delivery zones page is not functional. | P1 | Fixed |
| BUG-U16 | New Product Wizard | New product Step 1 can lose entered basics when moving to Availability. Step 2 shows `Product draft required` because a durable product draft ID is missing; returning to Basics resets the form. Image upload also appears broken in this flow. | P0 | Newly reported |
| BUG-U17 | Admin Header Date Range | Dashboard date range selector is mounted globally. On non-dashboard pages it shows Today, and changing it redirects to `/admin`, so Orders/Catalog pages unexpectedly jump back to Dashboard instead of preserving context. | P1 | Newly reported |

## 4. Additional Issues Discovered By Audit

| ID | Area | Issue | Priority | Status |
|---|---|---|---|---|
| BUG-A01 | Shared Admin UI | `StatCard`/`IconBubble` still support `yellow` and `gray` tones, so pages can easily drift away from Smogy Ice primary-color consistency. This is the root cause behind several card icon color issues. | P2 | Fixed |
| BUG-A02 | Catalog Products | Product table uses `filteredProducts.slice(0, 10)` and static pagination labels, so pages 2/3/25 are visual only. | P1 | Fixed |
| BUG-A03 | Catalog Products | Product page has no `page` or `pageSize` parsing in `searchParams`, unlike Orders. | P1 | Fixed |
| BUG-A04 | Product Edit Flow | Existing product editing reuses `/admin/catalog/products/new` and keeps creation language: title is `New product`, subtitle is `Create your item in 4 simple steps`, and primary CTAs are wizard CTAs. | P1 | Fixed |
| BUG-A05 | Product Edit Flow | `Save draft` buttons are static UI and do not submit or save anything. | P1 | Fixed |
| BUG-A06 | Product Edit Flow | `Publish product` on Step 4 is only a link back to `/admin/catalog/products`; it does not publish, validate, or update product status. | P1 | Fixed |
| BUG-A07 | Product Availability | `Available in all branches` toggle is displayed but not actually read by `updateProductBranchAvailability`; only individual branch inputs are persisted. | P1 | Fixed |
| BUG-A08 | Product Edit Flow | `View branch list`, `Add variation group`, and `View all` controls in the product wizard are visual-only buttons with no behavior. | P2 | Fixed |
| BUG-A09 | Product Variations/Add-ons | Variation/add-on edit rows auto-save only when their small row form is submitted; there is no unified dirty-state/save model for the whole step. | P1 | Fixed |
| BUG-A10 | Categories | Category image upload UI exists, but category schema/database/action do not persist category images. | P2 | Fixed |
| BUG-A11 | Categories | Category `Cancel` button is `type="button"` with no reset/navigation behavior. | P2 | Fixed |
| BUG-A12 | Catalog Settings | `Catalog name` is accepted by the form but is not persisted anywhere by `updateCatalogSettings`. | P1 | Fixed |
| BUG-A13 | Catalog Settings | `taxEnabled` can be saved, but order creation always writes `taxTotal: 0`; the tax setting is misleading/non-functional for MVP. | P1 | Fixed |
| BUG-A14 | Catalog Settings | Notification toggles are partially saved or purely visual, but no real email/customer notification behavior exists behind them. | P2 | Fixed |
| BUG-A15 | Catalog Settings | Delivery/pickup/minimum-order concepts are duplicated across Catalog Settings, main Settings, and Branch Settings, creating confusing ownership. | P1 | Fixed |
| BUG-A16 | Branches | Branches page `Add branch` sends users to `/admin/branches/settings` instead of opening a branch creation flow in context; this may be technically reachable but feels broken from the main page. | P1 | Fixed |
| BUG-A17 | Branches | Branch details tab has no clear visible temporary-closure toggle; it can preserve an existing `isTemporarilyClosed` state but does not expose clean close/reopen control. | P0 | Fixed |
| BUG-A18 | Branches | Pickup control in Branch Details is only a visual `ToggleVisual`; it is not an editable input. | P1 | Fixed |
| BUG-A19 | Storefront Branch Availability | Storefront `isOpenNow` ignores weekly operating hours and only checks `isAcceptingOrders && !isTemporarilyClosed`. | P0 | Fixed |
| BUG-A20 | Storefront Branch Availability | Client-side after-hours test mode could bypass off-hours restrictions for `smogyice-demo`; production/demo behavior now always respects branch open/closed state in the checkout UI. | P0 | Fixed |
| BUG-A21 | Order API | Server order creation blocks paused/temporarily closed branches but does not validate weekly operating hours. | P0 | Fixed |
| BUG-A22 | Delivery Overview | Branch dropdown in Delivery Overview sets `branch` but the table filter ignores it; it only affects selected detail panel. | P1 | Fixed |
| BUG-A23 | Delivery Zones | Branch selector on Delivery Zones page is a plain form select with no submit button/on-change navigation, so changing it does not update the branch. | P1 | Fixed |
| BUG-A24 | Delivery Zones | After creating a delivery zone, redirect returns only to `?branch=...`; it does not select the newly created zone, so the editor may show the first zone and make the new zone appear lost. | P1 | Fixed |
| BUG-A25 | Delivery Zones | Delivery zone duplicate-name errors are not handled gracefully even though `branchId + name` is unique in the database. | P2 | Fixed |
| BUG-A26 | Delivery Zones | Checkout rules show `Require minimum order` as a static display of selected zone minimum; it is not an editable rule control in that section. | P2 | Fixed |
| BUG-A27 | Main Settings | Main Settings still links Delivery through `/admin/delivery`, a legacy redirect, instead of the approved `/admin/branches/delivery` path. | P2 | Fixed |
| BUG-A28 | Storefront Delivery Rules | Checkout always uses the first active delivery zone for a branch. Free-text address/area does not map to distance/radius zones, so zone fee selection is not truly dynamic yet. | P1 | Fixed |
| BUG-A29 | Storefront Checkout | Area dropdown is collected into notes but does not affect branch/zone selection or delivery fee. | P2 | Fixed |
| BUG-A30 | Product Delete UX | Product delete hard-deletes the product record. Order item snapshots remain safe through `onDelete: SetNull`, but this behavior should be made explicit or converted to archive if we want safer restaurant operations. | P2 | MVP accepted |
| BUG-A31 | Customers | Customers table has client-side pagination, but `Rows per page` is a static button. The user cannot actually change rows per page. | P2 | Fixed |
| BUG-A32 | Dashboard | Dashboard customer table only receives `recentCustomers` from the selected date range, capped to 25 records. This can make the dashboard/customer activity table look empty for historical ranges even when the customer directory has data. | P2 | MVP accepted |
| BUG-A33 | Dashboard | Dashboard status chart uses multiple chart variables for confirmed/pending/cancelled. This is visually inconsistent with the Smogy Ice single-primary admin theme unless intentionally toned. | P2 | Fixed |
| BUG-A34 | Orders | Orders page has real pagination, but page size is hardcoded to 20. There is no UI to change page size, unlike what users may expect from product/customer tables. | P2 | Fixed |
| BUG-A35 | Orders | Admin cannot confirm or cancel an order from the order detail screen. Per MVP this may be intentional because staff action should happen through WhatsApp, but the detail screen currently reads like an inspection tool only and offers no visible action path. | P2 | Fixed with mock WhatsApp admin action |
| BUG-A36 | Orders / Demo Flow | Mock WhatsApp confirm/cancel actions exist only inside provider log payloads/API endpoint. There is no clean admin-facing mock inbox/action UI, so demo staff action is hard to perform without technical steps. | P1 | Fixed |
| BUG-A37 | WhatsApp | WhatsApp connection secrets are stored directly as `accessTokenEncrypted`/`webhookVerifyTokenEncrypted` from form input. The field name says encrypted, but no encryption helper is applied in the action. | P0 | Fixed |
| BUG-A38 | WhatsApp | Creating or updating a branch-specific WhatsApp route does not prevent multiple active routes for the same branch. Resolution chooses the earliest active route, so later intended route changes may not actually be used. | P1 | Fixed |
| BUG-A39 | WhatsApp | Deleting a WhatsApp route hard-deletes the connection. Existing orders use `onDelete: SetNull`, so history survives, but route auditability is reduced. Consider archive/deactivate behavior for production. | P2 | Fixed |
| BUG-A40 | Branches | Branch search form has no explicit submit/apply/reset affordance. It may work by pressing Enter, but from a user workflow perspective the filter looks passive and can feel broken. | P2 | Fixed |
| BUG-A41 | Branches | The right-panel close `X` is a static icon, not a button/link. It does not close or hide the inspector. | P2 | Fixed |
| BUG-A42 | Branches | Branch status badge shows `Active` based only on `isActive`, not whether the branch is accepting orders or temporarily closed. A temporarily closed branch can still look Active in the branch list. | P1 | Fixed |
| BUG-A43 | Branches | Branch list `Hours` column shows the first non-closed day and labels it `Every day`, even if hours differ by day. This can display incorrect operating hours. | P1 | Fixed |
| BUG-A44 | Branches | Branch Details uses `isAcceptingOrders` toggle as `Delivery`, but the data model has no branch-level `deliveryEnabled` or `pickupEnabled`; pickup is visual-only. This creates a mismatch between UI and real branch capabilities. | P1 | MVP accepted |
| BUG-A45 | Branches | Updating branch details preserves `isTemporarilyClosed` only if it was already true via hidden input. There is no reliable UI path to toggle temporary closure on/off from the branch detail panel. | P0 | Fixed |
| BUG-A46 | Branches | `Catalog` tab only summarizes available products and links to Products. It does not allow branch-level product availability editing, despite looking like a branch catalog control area. | P2 | MVP accepted |
| BUG-A47 | Branch Settings | New branch creation form only collects branch profile/default hours. It does not create default delivery zones or WhatsApp route mapping, so a newly created branch may not appear usable for delivery until extra setup is completed elsewhere. | P1 | MVP accepted |
| BUG-A48 | Delivery Overview | Delivery `Open now` calculation ignores weekly operating hours and only checks temporary/accepting status. It can show branches open when they are outside their schedule. | P0 | Fixed |
| BUG-A49 | Delivery Overview | Delivery table `Hours` column repeats the same first-open-day problem as Branches and can label non-uniform schedules as `Every day`. | P1 | Fixed |
| BUG-A50 | Delivery Overview | `Delivery` and `Pickup` fulfillment rows in the right panel are visual-only in parts; pickup cannot be independently changed. | P1 | MVP accepted |
| BUG-A51 | Delivery Overview | `Visible in checkout` uses branch `isActive`, so hiding a branch from checkout also makes it inactive everywhere. There is no separate `visibleInCheckout` setting. | P1 | MVP accepted |
| BUG-A52 | Delivery Zones | Delivery zones page only loads active branches because `getDeliveryZoneManagementData` filters `isActive: true`. Inactive/hidden branches vanish from zone management, making it hard to reconfigure them. | P1 | Fixed |
| BUG-A53 | Delivery Zones | Add-new-zone mode uses default editor values (`3 km`, `PKR 120`, sort `1`) even if these duplicate existing zone names/sort order, increasing accidental duplicate/constraint errors. | P2 | Fixed |
| BUG-A54 | Delivery Zones | Delivery zone delete buttons do not use a confirmation component. Accidental clicks can remove zones immediately. | P1 | Fixed |
| BUG-A55 | Delivery Zones | Minimum-order rule is zone-level, but the Checkout Rules card presents it like a branch-level dropdown. This can mislead users into thinking there is one branch minimum when each zone has its own. | P2 | Fixed |
| BUG-A56 | Catalog Categories | Category search/filter has a filter icon button that submits the search form but has no actual additional filter behavior. It looks like an advanced filter that does nothing. | P2 | Fixed |
| BUG-A57 | Catalog Categories | Category delete exists only in selected details and is blocked if products exist. There is no move-products flow, so restaurants can get stuck if they want to remove a category with products. | P2 | MVP accepted |
| BUG-A58 | Catalog Categories | Creating a category redirects to `/admin/catalog/categories` without selecting the new category. User may not immediately see/edit the created category if list order changes. | P2 | Fixed |
| BUG-A59 | Catalog Products | Product status filter maps only `available` / `out-of-stock`, but product state also includes `isActive`, delivery availability, pickup availability, branch availability, and draft duplicate copies. Filters do not cover these real states. | P1 | Fixed |
| BUG-A60 | Catalog Products | Duplicated products are created as inactive draft copies, but Product list labels availability only from `isAvailable`. A duplicated inactive product can appear semantically confusing unless the UI clearly shows draft/inactive state. | P1 | Fixed |
| BUG-A61 | Product Wizard | Add-on selections are not sent from storefront cart/checkout. Checkout always posts `addonIds: []`, so add-ons configured in admin cannot actually be purchased from the Smogy storefront yet. | P0 | Fixed |
| BUG-A62 | Product Wizard / Storefront | Product variants are supported, but cart key only includes product and variant. If add-ons become enabled later, cart key must include add-on selections or different add-on combinations will merge incorrectly. | P1 | Fixed |
| BUG-A63 | Storefront Menu | Storefront product filtering uses product-level `availableBranchIds`, but the UI does not visibly filter/menu-disable products by the selected branch before checkout. Customers can add items that later fail branch availability validation. | P1 | Fixed |
| BUG-A64 | Storefront Checkout | Selected branch is not persisted in localStorage, while cart and order type are persisted. Returning customers can keep a cart/order type but lose branch selection. | P2 | Fixed |
| BUG-A65 | Storefront Checkout | `deliveryInstructions` exists in validation/notes builder but no visible input appears in the current checkout form. This is dead state and can confuse future changes. | P2 | Fixed |
| BUG-A66 | Storefront Checkout | Delivery area is a static UI dropdown and is appended to notes only. It does not drive branch selection, delivery zone, delivery fee, or minimum order. | P1 | Fixed |
| BUG-A67 | Storefront Checkout | Checkout displays `Delivery orders are accepted ... within 5 km`, but actual fee/radius logic uses first active delivery zone and does not validate distance/area. | P1 | Fixed |
| BUG-A68 | Storefront Checkout | Client-side branch open/closed message says orders open daily at 2:00 PM, but this is hardcoded and not derived from branch operating hours. | P2 | Fixed |
| BUG-A69 | Storefront Checkout | The order summary includes `Live Order Tracking` benefit cards, but live tracking is not part of MVP. This can overpromise to customers. | P2 | Fixed |
| BUG-A70 | Storefront Order Success | Pending orders show `Order Placed!` and tell users staff will confirm/cancel; earlier confirmation-page design requested immediate success language. Current MVP intentionally keeps WhatsApp staff confirm/cancel, so pending-confirmation copy is the correct behavior for now. | P2 | MVP accepted |
| BUG-A71 | Storefront Order Success | Support email/phone/hours are hardcoded for Smogy Ice in the component instead of fully coming from restaurant settings. | P1 | Fixed |
| BUG-A72 | Storefront Order API | Server validates restaurant global delivery/pickup settings and branch active/accepting/temporary-closed state, but does not validate branch weekly operating hours. | P0 | Fixed |
| BUG-A73 | Storefront Order API | Server does not validate that selected branch supports pickup separately. `supportsPickup` is hardcoded true in storefront repository. | P1 | MVP accepted |
| BUG-A74 | Storefront Order API | Server uses the first active delivery zone by sort/fee for all delivery orders. No distance, area, branch zone, or customer address matching exists. | P1 | Fixed |
| BUG-A75 | Storefront Order API | Tax setting can be enabled in admin but order API always writes `taxTotal: 0`, creating a mismatch between settings and stored orders. | P1 | Fixed |
| BUG-A76 | Storefront Data | Storefront branch `supportsDelivery` is true only when a branch has active delivery zones. If a branch has delivery enabled but zones are missing, it disappears from delivery checkout without a clear admin warning. | P1 | MVP accepted |
| BUG-A77 | Admin Search | Admin global search index only includes branches. Placeholder says search pages, branches, or customers, but customers/pages are not indexed. | P2 | Fixed |
| BUG-A78 | Main Settings | Delivery nav card routes through legacy `/admin/delivery` redirect. This works but is inconsistent with approved structure and can confuse URL hygiene. | P2 | Fixed |
| BUG-A79 | Security / UX | Server action errors often redirect with generic messages. Constraint errors like duplicate branch/category/product/zone names are not converted into specific user-friendly messages. | P1 | Fixed for audited constraints |
| BUG-A80 | Data Integrity | Slug changes are allowed for restaurant and branches from settings. This can break existing storefront/admin URLs if changed accidentally, especially after deployment. | P1 | MVP accepted |
| BUG-A81 | Login / Security | Login `next` redirect accepts any string starting with `/`. Protocol-relative values like `//example.com` should be explicitly blocked to avoid an open-redirect class of issue. | P1 | Fixed |
| BUG-A82 | Admin Search | Branch search results all navigate to `/admin/branches` only. They do not select or focus the specific branch that was clicked, so search feels incomplete for branch operations. | P2 | Fixed |
| BUG-A83 | Admin Search | Search copy says users can search pages, branches, orders, and customers, but default result indexing only includes static pages and branches. Orders/customers require secondary action buttons and are not true unified search results. | P2 | Fixed |
| BUG-A84 | Storefront SEO | Storefront tenant layout has static `title: Smogy Ice` and icon only. It does not set per-page descriptions, canonical URLs, Open Graph, or page-specific metadata for home/menu/checkout/order-success. | P1 | Fixed |
| BUG-A85 | Storefront Footer | Social links, Privacy Policy, Terms of Service, and Track Order footer links use `href="#"` or have no real destination. They look live but do nothing useful. | P2 | Fixed |
| BUG-A86 | Storefront Newsletter | Newsletter email input and submit button are visual only. There is no form action, validation, storage, or success/failure feedback. | P2 | MVP accepted |
| BUG-A87 | Storefront Cart | Cart drawer says `Delivery uses live location within 5 km`, but live location is not implemented and checkout uses manual address plus first active delivery zone. | P2 | Fixed |
| BUG-A88 | Storefront Routing | Root storefront deployment depends on `NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG`. If this env is missing or wrong, `/`, `/menu`, `/checkout`, and `/order-success/...` 404 even if `/storefront/[slug]` works. Needs deployment validation guard. | P1 | Fixed |
| BUG-A89 | Storefront Order Success | Order success page was accessible by order number alone on client storefront deployment. Order creation now returns a signed access token, checkout redirects include it, and order-success summary lookup rejects missing/mismatched/tampered tokens. | P1 | Fixed |
| BUG-A90 | Storefront Branding Data | Storefront shell still hardcodes Smogy phone/email/logo/social/footer copy instead of fully using restaurant settings. This is acceptable for Smogy demo but blocks clean reuse for the next restaurant. | P1 | Fixed |
| BUG-A91 | WhatsApp Meta Webhook | Example env previously encouraged `WHATSAPP_META_ALLOW_UNSIGNED_WEBHOOKS=true`. The runtime already permits unsigned webhooks only outside production, and `.env.example` now defaults the flag to `false` with a local-only note. | P0 | Fixed |
| BUG-A92 | WhatsApp Meta Payload | Meta interactive payload sends staff order notification to `connection.displayPhoneNumber`. The same field is also used as the route display number, so confirm this is the staff receiving number, not only the business phone label. | P1 | Fixed |
| BUG-A93 | WhatsApp Meta Payload | Meta interactive payload footer is hardcoded to `NapCart`, not the restaurant/client brand. For Smogy Ice demo, staff-facing WhatsApp messages may expose platform branding unexpectedly. | P2 | Fixed |
| BUG-A94 | Product Assets | Product image upload creates a new public file every time an image is changed, but old product images are not deleted or replaced. This can leak unused files and clutter storage over time. | P2 | Fixed |
| BUG-A95 | Restaurant Assets | Restaurant logo upload creates a new public file every time the logo changes, but old logos are not cleaned up. Low demo risk, but production storage hygiene issue. | P2 | Fixed |
| BUG-A96 | Admin Dark Mode | Header includes a dark/light theme toggle, but Smogy Ice admin was designed and approved as a controlled branded light interface. Dark mode may produce unreviewed contrast/theming bugs across Phase 4.5 screens. | P2 | Fixed |
| BUG-A97 | Admin Account | Password change form lives in a sheet but success/error feedback is delivered through redirects/query notices. Verify that users actually see the result after the sheet closes; otherwise password changes feel silent. | P2 | Fixed |
| BUG-A98 | Branch Delete | Branch delete exists in server action but is not exposed clearly in the main Branches UI. If branch deletion is intended, there is no discoverable workflow; if not intended, action should not remain reachable from future accidental forms. | P2 | MVP accepted |
| BUG-A99 | Order Privacy | Admin order detail page exposes customer phone/address snapshots to any active admin user for the restaurant. MVP has one admin, but future multi-role support will need role/permission scoping. | P2 | Future risk |
| BUG-A100 | QA Coverage | The repo now has a focused regression harness for branch operating hours, Pakistan phone normalization, and order-success access tokens. Browser/database regression coverage for checkout/product/branch/delivery/WhatsApp flows remains future hardening. | P1 | Partially fixed |
| BUG-A101 | New Product Wizard Architecture | New product creation and product editing share one `/admin/catalog/products/new` wizard, but only edit mode has a reliable saved product record. New mode should create an explicit draft on Step 1 before any later step is reachable. | P0 | Newly discovered |
| BUG-A102 | Product Image Upload UX | Product upload control is a hidden file input with no selected-file preview/name and no upload error boundary around storage failures. Users cannot tell whether the image was selected, uploaded, failed validation, or failed storage. | P1 | Newly discovered |
| BUG-A103 | Product Wizard Data Loss | Step 1 form state exists only in the browser form until the server action succeeds. Failed create/upload/validation redirects do not repopulate submitted values, causing perceived data loss. | P0 | Newly discovered |
| BUG-A104 | Admin Header Scope | `DateRangeSelector` reads the current page query params and always writes dashboard params to `/admin`. It needs route scoping: dashboard-only control, or a true global date-filter contract across pages. Current behavior is neither. | P1 | Newly discovered |

## 5. Questions Requiring Product Decision

| ID | Question | Current Recommendation | Status |
|---|---|---|---|
| Q01 | Should `Draft Changes` remain on Catalog Overview? | Keep for now as an MVP draft/inactive product signal, but normalize its icon color to the Smogy Ice primary theme. | Resolved |
| Q02 | What should Catalog Settings contain in MVP? | Keep catalog-specific persisted settings only; move/point branch, delivery, WhatsApp, and restaurant-wide controls to their approved sections. | Resolved |
| Q03 | Product edit UX: save on each step or keep step flow? | New products keep the 4-step wizard. Existing products expose explicit save actions per step/row and keep next-step navigation separate where needed. | Resolved |

## 6. Audit Checklist

| Area | Checks | Status |
|---|---|---|
| Orders list | Cards, filters, detail CTA, pagination, order links | Inspected |
| Order detail | Cards, payment summary layout, provider logs, status actions | Inspected |
| Dashboard | Theme consistency, filters, chart states, customer table | Inspected |
| Catalog overview | Summary cards, quick actions, recent products, links | Inspected |
| Categories | Create/edit/delete, filters/search, selected category details | Inspected |
| Products | Search/filter/pagination, create/edit/delete/duplicate, per-page selector | Inspected |
| Product wizard/edit | Step behavior, save behavior, variations/add-ons, publish flow | Inspected |
| Catalog settings | Relevance, functionality, MVP alignment | Inspected |
| Branches | Create/edit, search, details tabs, service toggles, visibility | Inspected |
| Delivery overview | Search/filter, selected branch panel, toggles, manage zones | Inspected |
| Delivery zones | Branch selector, zone CRUD persistence, checkout rules | Inspected |
| Storefront | Branch availability, menu, cart, checkout, order confirmation | Inspected |
| WhatsApp mock/provider workflow | Connection routing, mock action endpoint, logs, admin visibility | Inspected |
| Security/scoping | Restaurant-specific admin scope and Smogy DB isolation | Partially inspected |
| Storefront SEO/navigation | Root storefront routes, footer links, metadata, order success access | Inspected |
| Build health | TypeScript and ESLint sanity checks | Passed |

## 7. Key Audit Conclusions So Far

1. The most urgent issues are not color polish; they are branch availability, delivery zone persistence/selection, branch creation/temporary close controls, and product edit/save behavior.
2. Several Phase 4.5 UI screens were implemented visually but still contain placeholder controls. These must be converted into real workflows or removed from the MVP.
3. Catalog Settings needs product-scope cleanup. It currently mixes catalog, delivery, tax, and notification concepts.
4. The product list should follow the Orders page pattern for search/filter/pagination instead of static pagination markup.
5. Storefront operating-hours enforcement is incomplete because both the storefront data mapper and order API ignore weekly operating hours.
6. Delivery zones exist in admin, but checkout fee selection is still simplistic: the first active zone is used, not area/distance matching.
7. WhatsApp mock action exists technically, but there is no clean non-technical staff action surface in the admin. This is a demo-readiness risk.
8. Storefront add-ons are not truly supported end-to-end yet because checkout submits no add-on IDs.
9. Branch delivery/pickup/visibility controls are currently modeled with a small number of branch booleans, but the UI presents them as richer independent controls. This mismatch must be simplified or the schema must expand.
10. Several customer-facing copy blocks overpromise features not in MVP, especially live tracking and fixed delivery radius messaging.
11. Storefront production readiness needs a small SEO/navigation pass because several footer links and metadata fields are still placeholders.
12. WhatsApp Phase 6A is structurally useful, but secret handling, unsigned webhook guardrails, and staff-facing brand copy need tightening before live Meta credentials.
13. The codebase currently passes lint and typecheck, so the main risk is not compilation; it is workflow correctness, persistence, and demo-facing behavior.
14. New product creation still has a flawed wizard contract: later steps depend on a persisted product draft, but the UI allows moving forward from unsaved client-only form state.
15. Dashboard analytics date range is implemented as a dashboard-only feature but is displayed as a global header control, creating cross-page navigation bugs.

## 8. Recommended Fix Batches

Batch 1 - P0 operational blockers:

- Branch create/temporary close/reopen controls.
- Storefront/API branch availability and operating-hours enforcement.
- Delivery zone persistence/selector flow.

Batch 2 - Product/catalog workflows:

- Product pagination and per-page selector.
- Existing product edit/save behavior.
- Product wizard placeholder controls.
- Category/image/settings cleanup.

Batch 3 - Orders/admin polish:

- Orders page card icon colors.
- Order detail provider-log icon color.
- Orders Register CTA wrapping and filter alignment.
- Catalog/product stat-card color consistency.

Batch 4 - Regression and demo pass:

- Storefront order flow.
- Admin order visibility.
- Branch and delivery rule behavior.
- Smogy Ice deployed environment verification.

Batch 5 - Workflow stabilization pass:

- Convert new product creation into an explicit draft-first flow.
- Add product image upload feedback and storage error handling.
- Scope Dashboard date range controls to the Dashboard route, or define a real global filter contract before showing it outside Dashboard.
- Add browser-level regression scripts for create product, edit product, dashboard date range, and order placement.

## 8.1 New Stabilization Approach - 2026-06-19

The bug pattern now is not isolated UI mistakes; it is workflow contracts being unclear. The fix approach should change from patching individual symptoms to stabilizing complete flows.

Principles:

- Every multi-step workflow must have a durable server-side record before Step 2.
- Every CTA must have one clear job: save, navigate, or submit-and-navigate. It must not silently do two different things depending on hidden state.
- Every global header control must either be truly global or only appear on pages where it applies.
- Every upload must show selected state, saved state, and failure state.
- Every critical workflow needs a repeatable smoke test before we call it fixed.

Immediate target flows:

- New product creation from empty state through Basics, Availability, Variations/Add-ons, Review, and final product list visibility.
- Existing product edit flow across all steps.
- Dashboard date range persistence and non-dashboard navigation behavior.
- Storefront order placement and admin order visibility.

## 9. Priority Definitions

- P0: Blocks demo correctness, order integrity, data persistence, or restaurant operations.
- P1: Important workflow bug or misleading admin behavior.
- P2: UI polish, consistency, layout, or lower-risk usability issue.

## 10. Fixing Progress

### Fix Pass 1 - 2026-06-18

Implemented and verified with `npm run typecheck` and `npm run lint`.

Fixed or mitigated:

- BUG-U01, BUG-U02, BUG-U05, BUG-U06, BUG-A01: normalized shared admin stat-card and icon-bubble colors to Smogy Ice primary theme so yellow/gray tones no longer drift into orange/mismatched icons.
- BUG-U03, BUG-U04: tightened Orders Register CTA wrapping and aligned filter controls toward the right.
- BUG-U07, BUG-U08, BUG-A02, BUG-A03: implemented real Catalog Products pagination and functional rows-per-page selector.
- BUG-U09, BUG-A04, BUG-A05, BUG-A07, BUG-A08: improved existing-product edit mode copy, save/next behavior for basics and availability, wired `availableEverywhere`, and converted visual-only wizard controls into honest links or MVP notes.
- BUG-A10, BUG-A11, BUG-A56, BUG-A58: removed misleading category image upload, made category cancel/search behavior real, and redirected newly created categories to the created category.
- BUG-U11, BUG-A12, BUG-A13, BUG-A14, BUG-A15: cleaned Catalog Settings so it only shows persisted catalog settings or links to the correct Branches/Delivery areas; removed misleading tax/notification/minimum-order controls from Catalog Settings UI and prevented currency save from clearing delivery minimums.
- BUG-U12, BUG-A16: new branch creation now redirects to the created branch using `__BRANCH_ID__`.
- BUG-A17, BUG-A42, BUG-A43, BUG-A45: added a visible temporary-closure control on Branch Details, made branch status reflect active/paused/closed state, and replaced misleading `Every day` labels with saved operating-hours summaries.
- BUG-U13, BUG-A19, BUG-A20, BUG-A21, BUG-A48, BUG-A72: added shared operating-hours enforcement, wired it into storefront branch state and server-side order creation, and removed the hardcoded `smogyice-demo` after-hours bypass.
- BUG-U14, BUG-U15, BUG-A23, BUG-A24, BUG-A25, BUG-A52, BUG-A54: delivery zones now redirect to the exact saved zone, branch selector has an Apply control, duplicate zone names show a friendly error, inactive branches remain configurable in zone management, and zone delete uses confirmation.
- BUG-A63, BUG-A64: storefront menu now filters products by selected branch and fulfillment type, and selected branch is persisted in localStorage.
- BUG-A69, BUG-A85, BUG-A86, BUG-A87: removed customer-facing live-tracking/live-location overpromises and replaced placeholder storefront footer/newsletter links with honest demo-safe destinations/copy.
- BUG-A81: login redirect now only accepts safe `/admin...` destinations.
- BUG-A37, BUG-A91: new WhatsApp tokens are encrypted via a field-encryption helper, legacy raw values remain readable, and unsigned Meta webhooks are only allowed in non-production when explicitly enabled.

### Fix Pass 2 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

Fixed or mitigated:

- BUG-A38: branch-specific WhatsApp routes now deactivate any other active route for the same branch when a new active route is saved, so the intended branch route is deterministic.
- BUG-A78: Main Settings now links directly to `/admin/branches/delivery` instead of the legacy `/admin/delivery` redirect.
- BUG-A82, BUG-A83: global admin search now deep-links branch results to the selected branch and the search placeholder now accurately mentions orders as a supported search action.
- BUG-A93: Meta WhatsApp interactive payload footer now uses the configured connection business name instead of hardcoded `NapCart`; mock/staff customer messages were also de-branded where safe.
- BUG-A67: checkout copy no longer claims a fixed 5 km live-radius rule; it now explains that delivery fee is confirmed from the selected branch's configured delivery zone.
- BUG-A84: slugged storefront routes now generate restaurant-aware metadata, canonical URL, Open Graph title/description, and icon metadata from restaurant/client data instead of hardcoded Smogy Ice metadata.
- BUG-A31: Customers table rows-per-page control is now functional with selectable page sizes.
- BUG-A39: WhatsApp route removal now archives/deactivates routes instead of hard-deleting them, preserving operational audit context.
- BUG-A55: Delivery Zones checkout-rules copy now clearly describes the selected zone minimum order instead of implying a separate branch-wide rule.
- BUG-A59, BUG-A60: Product status filtering now distinguishes `Draft` from `Out of stock`, and inactive duplicated products are labeled as drafts instead of misleading availability states.
- BUG-A92: WhatsApp route form copy now identifies the phone number as the staff receiving number for order notifications.

Still open after Fix Pass 2:

- BUG-A35 and BUG-A36: admin-facing order confirm/cancel and mock inbox need product decision because MVP originally routes staff action through WhatsApp.
- BUG-A47, BUG-A50, BUG-A51, BUG-A76: deeper branch fulfillment/visibility modeling is still constrained by the current MVP schema.
- BUG-A61, BUG-A62: storefront add-on purchase UI is still not implemented end-to-end; product add-ons exist in admin but checkout does not select them yet.
- BUG-A66 and BUG-A74: true address-to-radius delivery zone matching is still not implemented; checkout still uses the first active branch zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A88 and BUG-A90: default deployment guard and fully data-driven storefront branding still need a dedicated production-readiness pass.
- BUG-A94, BUG-A95, BUG-A96, BUG-A97, BUG-A98, BUG-A99, BUG-A100: lower-risk production hardening and QA coverage items remain open.

### Fix Pass 3 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

Fixed or mitigated:

- BUG-A61, BUG-A62: storefront product cards now render dynamic add-on groups, enforce required/min/max selection rules, include selected add-ons in cart keys, cart display, checkout review, and order submission payloads. This wires storefront add-on purchase flow into the existing server-side `addonIds` validation and order-item add-on persistence.
- BUG-A47, BUG-A50, BUG-A51, BUG-A76: branch and delivery admin panels no longer present pickup/visibility as independent controls that the current MVP schema cannot persist. Copy now explains that pickup follows restaurant-wide pickup settings plus branch active/open/accepting-order state, and storefront branch capabilities no longer hardcode pickup/delivery support for inactive branches.

Still open after Fix Pass 3:

- BUG-A35 and BUG-A36: admin-facing order confirm/cancel and mock inbox need product decision because MVP originally routes staff action through WhatsApp.
- BUG-A66 and BUG-A74: true address-to-radius delivery zone matching is still not implemented; checkout still uses the first active branch zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A88 and BUG-A90: default deployment guard and fully data-driven storefront branding still need a dedicated production-readiness pass.
- BUG-A94, BUG-A95, BUG-A96, BUG-A97, BUG-A98, BUG-A99, BUG-A100: lower-risk production hardening and QA coverage items remain open.

### Fix Pass 4 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, and `git diff --check`.

Fixed or mitigated:

- BUG-A88: storefront deployments now fall back to the first active restaurant when `NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG` is missing, instead of immediately rendering a root 404. A configured default slug still remains the preferred production path.
- BUG-A90: storefront navbar, footer, and order-success support contact blocks now use restaurant logo/name/support phone/contact email from storefront data where available, while preserving Smogy Ice fallbacks for the current demo.
- BUG-A94, BUG-A95: replacing a product image or restaurant logo now removes the previous asset from the NapCart Supabase asset bucket after the database update succeeds, reducing unused storage clutter without touching external URLs.
- BUG-A90 production deployment detail: Next image remote patterns now include the Supabase hostname from `NEXT_PUBLIC_SUPABASE_URL`, so separate restaurant Supabase projects can render uploaded logos/products without manual `next.config` edits.

Still open after Fix Pass 4:

- BUG-A35 and BUG-A36: admin-facing order confirm/cancel and mock inbox need product decision because MVP originally routes staff action through WhatsApp.
- BUG-A66 and BUG-A74: true address-to-radius delivery zone matching is still not implemented; checkout still uses the first active branch zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A96, BUG-A97, BUG-A98, BUG-A99, BUG-A100: lower-risk production hardening and QA coverage items remain open.

### Fix Pass 5 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, and a code search for removed dark-theme controls.

Fixed or mitigated:

- BUG-A96: removed the unreviewed admin dark-mode toggle from the header controls and force-reset any previously saved `napcart-theme=dark` preference back to the approved branded light interface. This protects Smogy Ice admin from unreviewed dark-mode contrast/theming regressions.

Still open after Fix Pass 5:

- BUG-A35 and BUG-A36: admin-facing order confirm/cancel and mock inbox need product decision because MVP originally routes staff action through WhatsApp.
- BUG-A66 and BUG-A74: true address-to-radius delivery zone matching is still not implemented; checkout still uses the first active branch zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: automated regression coverage for checkout/product/branch/delivery/WhatsApp flows remains open.

### Fix Pass 6 - 2026-06-18

Verified from current code paths; no code changes required.

Closed or downgraded:

- BUG-A97: password-change feedback is delivered through `redirectWithNotice` / `redirectWithError` to the current admin pathname, and admin pages render `PageNotice` from `notice` / `error` query params. This is sufficient for MVP; optional browser QA can still be done before demo.
- BUG-A98: no branch-delete UI or branch-delete server action was found by code search, so there is no current discoverable branch deletion workflow to accidentally trigger. Future branch deletion/archive policy remains a product decision, not an active demo bug.

Still open after Fix Pass 6:

- BUG-A35 and BUG-A36: admin-facing order confirm/cancel and mock inbox need product decision because MVP originally routes staff action through WhatsApp.
- BUG-A66 and BUG-A74: true address-to-radius delivery zone matching is still not implemented; checkout still uses the first active branch zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: automated regression coverage for checkout/product/branch/delivery/WhatsApp flows remains open. The app currently has no test runner script in `apps/web/package.json`.

### Fix Pass 7 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, and targeted code searches.

Fixed or tightened:

- BUG-U02, BUG-U05: removed remaining `tone="yellow"` icon usage from Order Detail `Provider logs` and Catalog Overview `Draft changes`, so those cards now use the shared Smogy Ice primary icon treatment directly.
- BUG-U04: fixed Orders Register filter layout by grouping `Apply` and `Clear` inside one right-aligned action cell, removing the empty reserved grid column that left awkward blank space to the right.
- BUG-A33: dashboard chart configuration now uses Smogy Ice primary color and primary-color tints for status/customer/revenue charts instead of generic multi-color chart variables.

Still open after Fix Pass 7:

- BUG-A35 and BUG-A36: admin-facing order confirm/cancel and mock inbox need product decision because MVP originally routes staff action through WhatsApp.
- BUG-A66 and BUG-A74: true address-to-radius delivery zone matching is still not implemented. The checkout now uses an explicit selected configured branch delivery zone for fee/minimum-order calculation, but automatic address-to-radius matching remains future scope.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: automated regression coverage for checkout/product/branch/delivery/WhatsApp flows remains open.

### Fix Pass 8 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, and targeted code searches.

Fixed or tightened:

- BUG-U01, BUG-U02, BUG-U05, BUG-U06, BUG-A33: tightened remaining page-local admin icon containers that did not use shared `StatCard` / `IconBubble`, including customer summary cards, settings cards, branch settings rows, orders table rows, and order detail timeline/log/detail cards. These now use Smogy Ice primary soft background plus primary icon color instead of neutral gray/black or orange/amber drift.
- BUG-A66, BUG-A74: replaced the static checkout area dropdown with a real branch delivery-zone selector. The visible checkout summary now calculates delivery fee/total from the selected configured zone, and order submission sends `deliveryZoneId` so the server validates and stores fee/minimum-order from that same active branch zone instead of silently using the first active zone.

Still open after Fix Pass 8:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: automated regression coverage for checkout/product/branch/delivery/WhatsApp flows remains open.

### Fix Pass 9 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, and targeted code searches.

Fixed or tightened:

- BUG-A35, BUG-A36: added a logged-in admin-only mock WhatsApp staff action surface on the order detail page. Pending orders with stored mock staff-notification tokens now show Confirm/Cancel buttons that use the existing signed mock WhatsApp action flow, update order status, write status history, and create provider/customer notification logs. Final-state orders do not show these controls.

Still open after Fix Pass 9:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: automated regression coverage for checkout/product/branch/delivery/WhatsApp flows remains open.

### Fix Pass 10 - 2026-06-18

Implemented and verified with `npm run typecheck`, `npm run lint`, `git diff --check`, and targeted code searches.

Fixed or tightened:

- BUG-U01, BUG-U02, BUG-U05, BUG-U06, BUG-A01: completed an additional admin icon-color sweep after visual review. Remaining page-local decorative icon containers in branch details, delivery panels, delivery-zone rules, product edit branch availability rows, product thumbnail placeholders, orders empty state, and order-not-found state now use Smogy Ice primary soft background plus primary icon color. Semantic colors remain intentionally preserved for active/open statuses, pending warnings, errors, destructive delete actions, and inactive wizard/checklist states.

Still open after Fix Pass 10:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A70, BUG-A89: order success copy/privacy model still needs final product decision.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: automated regression coverage for checkout/product/branch/delivery/WhatsApp flows remains open.

### Fix Pass 11 - 2026-06-19

Implemented and verified with `npm run test:regression`, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

Fixed or tightened:

- BUG-A100: added a lightweight Node regression test harness (`npm run test:regression`) covering critical pure logic for branch operating-hours enforcement and Pakistan phone normalization.
- BUG-A48, BUG-A72: regression coverage exposed and fixed an overnight-hours edge case. A branch open Monday 18:00-03:00 now remains open after midnight on Tuesday until the 03:00 close boundary, instead of incorrectly closing because Tuesday had no same-day row.

Still open after Fix Pass 11:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A89: order success privacy model still needs implementation.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: full browser/database regression coverage for checkout/product/branch/delivery/WhatsApp flows remains future hardening; the first focused regression harness is now present and passing.

### Fix Pass 12 - 2026-06-19

Implemented and verified with `npm run test:regression`, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

Fixed or tightened:

- BUG-A70: closed as an MVP product decision. The current order lifecycle is intentionally `Pending Confirmation` until staff confirm/cancel through WhatsApp/mock WhatsApp/admin action, so customer success copy should not promise final restaurant confirmation immediately.
- BUG-A89: added signed storefront order access tokens. The order creation response now includes a server-signed token, checkout redirects to order success with that token, and both restaurant-scoped and root order-success pages require a valid token before showing customer/order details.
- BUG-A100: extended the regression harness with token signing/verification coverage so missing, mismatched, and tampered order-success access tokens are rejected.

Still open after Fix Pass 12:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: full browser/database regression coverage for checkout/product/branch/delivery/WhatsApp flows remains future hardening; focused pure-logic coverage is now present and passing.

### Fix Pass 13 - 2026-06-19

Implemented and verified with `npm run test:regression`, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

Fixed or tightened:

- BUG-A20: removed the public after-hours checkout bypass and the visible “Test mode is active” notice from the Smogy storefront checkout. Branches that are closed by temporary closure, accepting-orders state, or weekly operating hours now stay blocked in the customer checkout UI. Server-side order creation was already enforcing the same rule.
- BUG-A91: changed `.env.example` so `WHATSAPP_META_ALLOW_UNSIGNED_WEBHOOKS` defaults to `false` with a local-only note. The runtime guard still only permits unsigned Meta webhook payload tests outside production.

Still open after Fix Pass 13:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: full browser/database regression coverage for checkout/product/branch/delivery/WhatsApp flows remains future hardening; focused pure-logic coverage is now present and passing.

### Fix Pass 14 - 2026-06-19

Implemented and verified with `npm run test:regression`.

Fixed or tightened:

- BUG-A61, BUG-A62: extracted storefront add-on selection validation into a shared helper used by order creation, then added regression coverage for required groups, duplicate add-on IDs, and max-selection rules. This protects checkout totals and prevents crafted duplicate add-on IDs from double-counting prices.
- BUG-A100: regression harness now covers 12 focused checks across branch hours, Pakistan phone normalization, order-success access tokens, and storefront add-on selection validation.

Still open after Fix Pass 14:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: full browser/database regression coverage for checkout/product/branch/delivery/WhatsApp flows remains future hardening; focused pure-logic coverage is now present and passing.

### Fix Pass 15 - 2026-06-19

Implemented and verified with `npm run test:regression`, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

Fixed or tightened:

- BUG-A41: Branch details `X` is now a real link that closes the inspector panel with `?panel=closed`; selecting a branch row reopens the inspector.
- Audit reconciliation: updated stale main-table statuses for the original user-reported bugs and matching fixed discovered bugs so the sheet now reflects the actual later fix passes instead of old discovery state.

Still open after Fix Pass 15:

- BUG-A66 and BUG-A74: automatic address/geocode-to-radius zone matching remains future scope. MVP now uses explicit customer-selected configured delivery zone.
- BUG-A99: future multi-role privacy scoping remains out of MVP scope because MVP has one restaurant admin.
- BUG-A100: full browser/database regression coverage for checkout/product/branch/delivery/WhatsApp flows remains future hardening; focused pure-logic coverage is now present and passing.

### Fix Pass 16 - 2026-06-19

Implemented and typechecked with `npm run typecheck`.

Fixed or reconciled:

- BUG-A09: product Step 3 now exposes explicit save/remove controls for existing variation and add-on rows instead of relying on implicit row-form submission.
- BUG-A34: Orders page now uses the existing repository `pageSize` support and exposes a functional rows-per-page selector.
- BUG-A53: Delivery zone “new zone” mode now derives a suggested name, radius, and sort order from existing zones instead of always defaulting to duplicate-prone `3 km` / sort `1`.
- BUG-A65: removed dead `deliveryInstructions` checkout state because no customer-facing field collected it.
- BUG-A68: Smogy storefront quick-action and branch-card hours now use branch operating-hours summaries from stored branch data instead of hardcoded `2:00 PM - 2:00 AM` copy.
- BUG-A81: tightened login/admin redirect handling on both the rendered login form and server action so only `/admin`, `/admin/...`, and `/admin?...` destinations are accepted.
- Audit reconciliation: updated stale discovered rows to `Fixed`, `MVP accepted`, `Future risk`, or `Partially fixed` based on the current code and earlier fix passes. The main bug table now has no unresolved `Discovered`, `Confirmed`, `Needs verification`, or `Needs decision` rows.

Remaining accepted scope after Fix Pass 16:

- BUG-A30, BUG-A32, BUG-A46, BUG-A47, BUG-A50, BUG-A51, BUG-A57, BUG-A80, BUG-A86, BUG-A98 are accepted MVP decisions rather than active demo blockers.
- BUG-A99 remains a documented future multi-role privacy risk.
- BUG-A100 remains partially fixed: focused regression coverage exists and passes, while full browser/database E2E coverage remains future hardening.

## 11. Verification Commands

Commands run during this audit:

- `npm run typecheck` in `apps/web` - passed.
- `npm run lint` in `apps/web` - passed.
- `npm run build` in `apps/web` - passed.
- `git diff --check` from repository root - passed.
- `rg "New NapCart Order|Your NapCart order|text: \"NapCart\"|within 5 km|live location|Live Order Tracking|/admin/delivery" apps/web/src` - no matches after Fix Pass 2.
- `rg "addonIds: \\[\\]|supportsPickup: true|Pickup follows this branch|New NapCart Order|Your NapCart order|within 5 km|Live Order Tracking|/admin/delivery" apps/web/src` - no stale matches after Fix Pass 3 except valid admin settings labels outside the targeted branch-detail UI.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 4.
- `npm run lint` in `apps/web` - passed after Fix Pass 4.
- `npm run build` in `apps/web` - passed after Fix Pass 4.
- `git diff --check` from repository root - passed after Fix Pass 4.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 5.
- `npm run lint` in `apps/web` - passed after Fix Pass 5.
- `npm run build` in `apps/web` - passed after Fix Pass 5.
- `git diff --check` from repository root - passed after Fix Pass 5.
- `grep -RIn "ThemeToggle\\|napcart-theme-change\\|Switch to dark\\|Switch to light\\|Moon\\|Sun" apps/web/src/components/admin apps/web/src/app/admin` - no matches after Fix Pass 5.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 7.
- `npm run lint` in `apps/web` - passed after Fix Pass 7.
- `npm run build` in `apps/web` - passed after Fix Pass 7.
- `git diff --check` from repository root - passed after Fix Pass 7.
- `grep -RIn "var(--chart-2)\\|var(--chart-3)\\|var(--chart-4)\\|var(--chart-5)\\|tone=\\\"yellow\\\"" apps/web/src/app/admin apps/web/src/components/admin` - no matches after Fix Pass 7.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 8.
- `npm run lint` in `apps/web` - passed after Fix Pass 8.
- `npm run build` in `apps/web` - passed after Fix Pass 8.
- `git diff --check` from repository root - passed after Fix Pass 8.
- `grep -RIn "bg-muted text-muted-foreground\\|bg-\\[#f1f1ef\\].*text-\\[#111\\]\\|text-orange\\|bg-orange\\|text-amber\\|bg-amber\\|border-amber\\|text-yellow\\|bg-yellow\\|border-yellow" apps/web/src/app/admin apps/web/src/components/admin` - no admin icon color drift matches after Fix Pass 8, except the intentional amber warning `PageNotice` style.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 9.
- `npm run lint` in `apps/web` - passed after Fix Pass 9.
- `npm run build` in `apps/web` - passed after Fix Pass 9.
- `git diff --check` from repository root - passed after Fix Pass 9.
- `grep -RIn "Mock WhatsApp staff action\\|applyAdminMockWhatsappAction\\|interactiveActions" apps/web/src/app/admin apps/web/src/server/storefront apps/web/src/app/api` - confirms admin mock action UI, server action, token source, and existing API endpoint are wired after Fix Pass 9.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 10.
- `npm run lint` in `apps/web` - passed after Fix Pass 10.
- `git diff --check` from repository root - passed after Fix Pass 10.
- `rg "bg-\\[#f1f1ef\\]|bg-\\[#eeeeeb\\]|text-orange|text-amber|text-yellow|bg-orange|bg-amber|bg-yellow|border-orange|border-amber|border-yellow" apps/web/src/app/admin apps/web/src/components/admin` - remaining matches after Fix Pass 10 are semantic neutral/warning/status/delete states, not decorative stat/icon drift.
- `npm run test:regression` in `apps/web` - passed after Fix Pass 11 with 7 tests covering branch hours and Pakistan phone normalization.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 11.
- `npm run lint` in `apps/web` - passed after Fix Pass 11.
- `npm run build` in `apps/web` - passed after Fix Pass 11.
- `git diff --check` from repository root - passed after Fix Pass 11.
- `npm run test:regression` in `apps/web` - passed after Fix Pass 12 with 9 tests covering branch hours, Pakistan phone normalization, and order-success access tokens.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 12.
- `npm run lint` in `apps/web` - passed after Fix Pass 12.
- `npm run build` in `apps/web` - passed after Fix Pass 12.
- `git diff --check` from repository root - passed after Fix Pass 12.
- `npm run test:regression` in `apps/web` - passed after Fix Pass 13 with 9 tests.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 13.
- `npm run lint` in `apps/web` - passed after Fix Pass 13.
- `npm run build` in `apps/web` - passed after Fix Pass 13.
- `git diff --check` from repository root - passed after Fix Pass 13.
- `npm run test:regression` in `apps/web` - passed after Fix Pass 14 with 12 tests covering branch hours, Pakistan phone normalization, order-success access tokens, and storefront add-on selection validation.
- `npm run test:regression` in `apps/web` - passed after Fix Pass 15 with 12 tests.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 15.
- `npm run lint` in `apps/web` - passed after Fix Pass 15.
- `npm run build` in `apps/web` - passed after Fix Pass 15.
- `git diff --check` from repository root - passed after Fix Pass 15.
- `npm run test:regression` in `apps/web` - passed after Fix Pass 16 with 12 tests.
- `npm run typecheck` in `apps/web` - passed after Fix Pass 16.
- `npm run lint` in `apps/web` - passed after Fix Pass 16.
- `npm run build` in `apps/web` - passed after Fix Pass 16.
- `git diff --check` from repository root - passed after Fix Pass 16.
- Audit unresolved-row parser - passed after Fix Pass 16; no `Discovered`, `Confirmed`, `Needs verification`, or `Needs decision` BUG-A rows remain.
- `rg "2:00 PM|Open Daily|live location|Live Order Tracking|within 5 km|href=\"#\"|/admin/delivery|WHATSAPP_META_ALLOW_UNSIGNED_WEBHOOKS=true|tone=\"yellow\"" apps/web/src apps/web/.env.example` - no stale matches after Fix Pass 16.
