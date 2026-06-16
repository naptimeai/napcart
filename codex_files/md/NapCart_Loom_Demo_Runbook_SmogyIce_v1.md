# NapCart Loom Demo Runbook - Smogy Ice v1

Version: v1.0
Date: 2026-06-16
Status: Active demo runbook

---

## 1. Goal

Record a clean Loom video showing Smogy Ice storefront and NapCart admin working as one complete ordering system.

The demo should prove:

- Smogy Ice has a branded customer storefront.
- Customers can place an order online.
- NapCart stores the order and customer data.
- Admin can review orders and operational logs.
- WhatsApp confirm/cancel workflow is ready through mock/provider layer.

---

## 2. Pre-Recording Setup

Open these tabs:

1. Smogy Ice storefront:
   `http://localhost:3000/storefront/smogyice-demo`
2. NapCart admin login:
   `http://localhost:3000/login`
3. NapCart orders:
   `http://localhost:3000/admin/orders`

Before recording:

- [ ] Start local server with `npm run dev`.
- [ ] Confirm storefront loads.
- [ ] Confirm admin login works.
- [ ] Place one test order privately before recording.
- [ ] Keep admin credentials ready.
- [ ] Close unrelated/private tabs.
- [ ] Zoom browser to comfortable recording size.

---

## 3. Suggested Script

### Opening

"This is NapCart by Naptime AI, configured here for Smogy Ice. The goal is to let customers place structured orders from the website while staff can continue operating through WhatsApp."

### Storefront

Show:

- Homepage branding.
- Menu navigation.
- Product selection.
- Cart.
- Checkout.
- Review order.
- Place order.
- Order success page.

Say:

"Instead of manually collecting item names, address, phone number, and instructions through WhatsApp, the system captures everything in a structured checkout."

### Admin

Show:

- Login.
- Dashboard.
- Orders list.
- New order detail.
- Customer details.
- Items and totals.
- Status history.
- Provider/WhatsApp logs.

Say:

"The owner/admin gets complete visibility, while the branch staff workflow remains WhatsApp-first."

### WhatsApp Mock Explanation

Say:

"For this demo, we are using the mock WhatsApp provider so testing is free and safe. The architecture already has an adapter layer for Meta WhatsApp Cloud API, so when production credentials are ready, we connect the real provider without changing the checkout or order engine."

### Close

"This proves the core flow: customer orders from the Smogy Ice website, NapCart stores the order, routes it to the branch workflow, and management can review everything from the admin dashboard."

---

## 4. What Not To Say

Avoid saying:

- "Live WhatsApp API is already connected" unless Meta credentials are connected and verified.
- "Payments are live."
- "Rider tracking is live."
- "Customer accounts are live."
- "This is the final production deployment" unless Vercel production is fully verified.

---

## 5. Backup Plan

If live localhost fails during recording:

1. Restart dev server:
   `cd "/Users/umar/Documents/Naptime AI/Resturants Ecom System/apps/web"`
   `npm run dev`
2. Refresh storefront.
3. Use an existing test order in admin if checkout gets interrupted.
4. Explain mock WhatsApp as a safe demo mode, not a missing feature.

