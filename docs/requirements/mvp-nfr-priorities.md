# MVP Non-Functional Requirements — Implementation Priorities

**Version:** 1.0  
**Date:** 2026-01-27  
**Purpose:** Define which NFRs are mandatory for the Junior MVP, which are best-effort, and what is postponed post-MVP.

---

## Phase 1 (MVP) — MUST IMPLEMENT (Non-Negotiable)

### Security (Critical)
- **NFR-S01:** Authentication & Authorization (Sanctum + RBAC + rate limiting for login)
- **NFR-S02:** Data Protection & Privacy (HTTPS in deployment plan, secrets in .env, no sensitive logs)
- **NFR-S03:** Input Validation & Sanitization (server-side validation + safe uploads)
- **NFR-S05:** Error Handling & Logging (no stack traces, sanitized logs, APP_DEBUG=false in prod)

### Usability (Critical)
- **NFR-U01:** UI aligned with Brand Identity (calm, museum-like, product as hero)
- **NFR-U02:** Responsive Design (mobile/tablet/desktop support)

### Maintainability (High)
- **NFR-M02:** Documentation (README + guides + API docs basics)
- **NFR-M03:** Version Control (branching strategy + PR templates + no direct pushes)

### Operations (High)
- **NFR-D03:** Environment Configuration (.env, .env.example, secrets never committed)

**Target:** 9 NFRs

**Verification Evidence (MVP):**
- Security checklist + screenshots/config snippets (sanitized)
- PR history showing reviews + templates usage
- Responsive screenshots on 3 breakpoints
- Docs folder completeness + .env.example present

---

## Phase 1 (MVP) — SHOULD IMPLEMENT (Best-Effort, Flexible Metrics)

### Performance
- **NFR-P01:** Page Load Time (target values; acceptable slight deviation in local env)
- **NFR-P04:** Image Loading & Optimization (WebP + thumbnails + lazy loading)

### Security
- **NFR-S04:** API Security (rate limits + CORS + security headers baseline)

### Maintainability
- **NFR-M01:** Code Quality (PSR-12/PEP8, linting where possible, code review discipline)

### Reliability
- **NFR-R03:** Data Integrity (FK constraints + transactions where needed + backup plan)

**Target:** +5 NFRs

**Verification Evidence (MVP):**
- Lighthouse report screenshots (Performance)
- Image size samples + lazy load proof
- API rate limiting tests (simple demo)
- Linter config or formatting rules proof
- DB schema showing constraints + backup plan doc

---

## Phase 2 (Post-MVP) — If Time Allows
All remaining NFRs:
- Scalability (SC01–SC03 full)
- Advanced performance targets (strict API ≤ 300ms, 100+ concurrent formal load tests)
- WCAG 2.1 AA complete compliance
- High availability + monitoring stack + fault tolerance patterns
- CI/CD advanced deployment + monitoring dashboards

---

## Summary
**Total MVP NFRs:** 14 (9 MUST + 5 SHOULD)  
This prioritization keeps documentation comprehensive while making implementation realistic for a Junior project.
