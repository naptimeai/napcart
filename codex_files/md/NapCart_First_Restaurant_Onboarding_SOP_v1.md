# NapCart First Restaurant Onboarding SOP v1

Version: v1.0
Date: 2026-06-16
Status: Active SOP
Owner: Naptime AI
Product: NapCart

---

## 1. Purpose

This SOP explains how to onboard the first real restaurant into NapCart without changing code unnecessarily.

For the current demo target, the restaurant is Smogy Ice.

---

## 2. Onboarding Inputs Required

Collect these before setup:

- Restaurant legal/display name.
- Restaurant slug for storefront URL.
- Logo and brand colors.
- Contact phone and public email.
- Branch list.
- Branch addresses.
- Branch operating hours.
- Branch pickup availability.
- Branch delivery availability.
- Delivery zone rules per branch.
- Menu categories.
- Products.
- Product prices.
- Product images.
- Variations, such as size.
- Add-ons, such as toppings/extras.
- WhatsApp receiving number per branch.
- Admin owner name and email.

---

## 3. Setup Sequence

### Step 1: Create Restaurant Record

Required fields:

- Name
- Slug
- Default currency: `PKR`
- Default timezone: `Asia/Karachi`
- Default country: `PK`
- Storefront status

Acceptance:

- Restaurant appears in database.
- Storefront route resolves by slug.

### Step 2: Create Admin User

Required:

- Supabase Auth user.
- Matching `admin_users` record.
- Restaurant scope.
- Admin role: owner/main admin.

Acceptance:

- Admin can sign in.
- Admin is scoped to the correct restaurant.
- Admin cannot access another restaurant.

### Step 3: Configure Branches

For each branch:

- Name
- Address
- Operating hours
- Delivery enabled
- Pickup enabled
- Checkout visibility
- Branch availability/open status

Acceptance:

- Branch appears in admin.
- Branch can be selected in storefront checkout.
- Closed/unavailable branch behavior matches MVP rules.

### Step 4: Configure Delivery Zones

For each delivery branch:

- Zone name
- Maximum distance/radius label
- Delivery fee
- Minimum order if required
- Sort order
- Active/inactive status

Acceptance:

- Delivery fee appears correctly at checkout.
- Inactive zones are not used.
- Pickup orders do not receive delivery fee.

### Step 5: Configure Catalog

Create:

- Categories
- Products
- Product image
- Product description
- Product base price
- Variations
- Add-ons
- Branch availability

Acceptance:

- Products appear in storefront menu.
- Cart price matches configured product/variation/add-on pricing.
- Product snapshots remain stable after order creation.

### Step 6: Configure WhatsApp Routing

MVP demo mode:

- Provider: `MOCK`
- Destination label: branch/team receiving endpoint
- Branch mapping

Live mode later:

- Provider: `META_CLOUD`
- Meta phone number ID
- Meta business account details
- Access token
- Webhook verify token
- App secret
- Branch destination mapping

Acceptance:

- New order creates outbound provider log.
- Confirm/cancel action updates backend order status.
- Customer notification contract/log is created.

### Step 7: Run Test Order

Run:

- Delivery order
- Pickup order
- Product with variation
- Product with add-on
- Confirm action
- Cancel action

Acceptance:

- Orders appear in admin.
- Status history is correct.
- Provider logs are correct.
- Customer record is created/reused.

---

## 4. Smogy Ice Demo Checklist

Before recording Loom:

- [ ] Smogy storefront opens.
- [ ] Homepage branding looks correct.
- [ ] Menu opens.
- [ ] At least one product can be added to cart.
- [ ] Checkout form works.
- [ ] Delivery and pickup options are clear.
- [ ] Order review screen works.
- [ ] Order success screen works.
- [ ] Admin login works.
- [ ] New order appears in admin orders.
- [ ] Order detail shows items/customer/branch/payment/status.
- [ ] WhatsApp/provider log appears.
- [ ] Mock confirm or cancel can be demonstrated.

---

## 5. Demo Talking Points

Use this framing:

- Smogy Ice gets a branded ordering experience.
- Customer places an order without WhatsApp back-and-forth.
- Staff still receives operational action through WhatsApp.
- Owner/management can monitor orders, customers, catalog, branches, and delivery rules from NapCart.
- Current demo uses mock WhatsApp for cost-free testing.
- Real Meta WhatsApp Cloud API can be connected through the existing adapter when credentials are ready.

Do not claim:

- Live rider tracking.
- Online payment support.
- Customer login accounts.
- Fully automated delivery dispatch.
- Real Meta WhatsApp message delivery unless live credentials are connected and tested.

---

## 6. Handoff Notes for First Client

Give the restaurant:

- Storefront URL.
- Admin URL.
- Admin credentials.
- Staff WhatsApp workflow explanation.
- Support contact.
- Known MVP limitations.
- Change request process.

Keep internally:

- Supabase project reference.
- Vercel project reference.
- Environment variable checklist.
- Admin setup notes.
- WhatsApp credential notes.
- Launch QA evidence.

