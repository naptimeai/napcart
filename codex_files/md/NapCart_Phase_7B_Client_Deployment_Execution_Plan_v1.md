# NapCart Phase 7B Client Deployment Execution Plan v1

Version: v1.0
Date: 2026-06-16
Status: Approved planning update - execution pending
Owner: Naptime AI
Target restaurant: Smogy Ice

---

## 1. Purpose

This document turns the updated MVP production decision into an execution path for Smogy Ice.

NapCart remains the core product codebase.
Smogy Ice becomes the first restaurant-specific production deployment.

---

## 2. Locked Production Decisions

- One main NapCart codebase remains the product source of truth.
- No permanent Git branch per restaurant.
- No full code duplication per restaurant.
- One dedicated Vercel project per real restaurant production launch.
- One recommended dedicated Supabase project per real restaurant production launch.
- Heavily branded storefronts may live in separate repos while consuming the same backend contract.
- Restaurant-facing URLs must use restaurant branding, not generic NapCart branding.

---

## 3. Target Production Shape for Smogy Ice

### 3.1 NapCart Core

Used for:

- internal development
- QA
- architecture evolution
- future product improvements

Should remain:

- reusable
- restaurant-aware
- not hardcoded to Smogy Ice

### 3.2 Smogy Ice Backend/Admin Deployment

Used for:

- Smogy Ice admin panel
- Smogy Ice order engine
- Smogy Ice order APIs
- Smogy Ice WhatsApp provider flow

Should have:

- dedicated Vercel project
- dedicated environment variables
- dedicated Supabase project
- Smogy Ice branding and metadata
- GitHub deployment source: main NapCart repo
- Vercel root directory: `apps/web`

### 3.3 Smogy Ice Storefront

Used for:

- public restaurant website
- menu browsing
- checkout flow
- customer-facing SEO pages

Should have:

- its own repo if heavily branded
- its own deployment
- API connection to the Smogy Ice backend/admin deployment
- GitHub deployment source: restaurant storefront repo
- restaurant-specific SEO metadata and public branding

---

## 4. Execution Sequence

### Step 1: Document Alignment

- update PRD
- update roadmap
- update implementation plan
- update architecture spec
- update onboarding SOP
- update Phase 7B checklist

### Step 2: Smogy Ice Infrastructure

- create dedicated Smogy Ice Supabase project
- create dedicated Smogy Ice Vercel project for backend/admin deployment
- define final Smogy Ice admin domain/subdomain target
- define final Smogy Ice storefront domain target

### Step 3: Smogy Ice Data Isolation

- apply the current NapCart schema to the new Smogy Ice Supabase project
- seed only Smogy Ice production-safe data
- create Smogy Ice admin auth user
- verify Smogy Ice-only restaurant scope

### Step 4: Backend/Admin Branding and Metadata

- replace generic public-facing NapCart URLs for the restaurant deployment
- make admin identity restaurant-aware
- confirm proper `noindex` behavior for admin pages
- confirm storefront metadata is restaurant-specific
- configure client branding through deployment variables instead of code forks:
  - `NEXT_PUBLIC_CLIENT_NAME`
  - `NEXT_PUBLIC_CLIENT_DESCRIPTION`
  - `NEXT_PUBLIC_CLIENT_ICON_PATH`

### Step 5: Storefront Connection

- point Smogy Ice storefront to the Smogy Ice backend deployment
- confirm storefront reads correct menu/config data
- confirm checkout posts to the correct backend/API
- verify order success flow against the Smogy Ice environment

### Step 6: Deployment Validation

- verify production build
- verify production admin login
- verify storefront load
- verify order placement
- verify mock WhatsApp flow
- verify order visibility in admin

### Step 7: Demo Readiness

- record final working URLs
- confirm credentials
- verify one clean demo order end-to-end
- prepare Loom demo sequence

---

## 5. Data Isolation Rules

- Smogy Ice production must not depend on shared internal demo data.
- Smogy Ice production database should contain only Smogy Ice-owned records.
- Smogy Ice storefront must not call the internal NapCart test deployment.
- Restaurant-facing production secrets must stay isolated from internal environments.

---

## 6. What Must Be Provided by the User

The following are likely needed during execution:

- approval to create the dedicated Smogy Ice Supabase project
- approval to create the dedicated Smogy Ice Vercel project
- final decision on Smogy Ice admin domain/subdomain
- Vercel environment variables entered after values are prepared
- domain/DNS access later if custom domains are connected

---

## 7. Success Criteria

Phase 7B client deployment packaging is complete when:

- Smogy Ice has a dedicated Supabase project
- Smogy Ice has a dedicated Vercel deployment
- Smogy Ice storefront is connected to the Smogy Ice backend
- Smogy Ice admin is reachable on its own production deployment
- one order can be placed successfully end-to-end
- mock WhatsApp confirm/cancel flow works in the Smogy Ice deployment
- no permanent restaurant branch or duplicated codebase is required

---

## 8. Important Guardrails

- Do not break NapCart core while packaging Smogy Ice.
- Do not hardcode Smogy Ice assumptions back into the reusable product core unless they are theme/config driven.
- Do not mix internal NapCart testing URLs with restaurant-facing production URLs.
- Do not expose admin routes or secrets to public SEO indexing.
