# SND Platform — Product overview (MVP)

This document describes the **Sales & Distribution (SND)** demo platform as implemented in this repository: **what exists today**, **which apps contain it**, and **how roles map to modules**.

It is a **control-plane + field** sketch: some areas are fully wired to the API; others are read-only or mock-backed. Treat this as a **product map**, not a production SLA.

---

## 1. Applications in this repo

| Application | Path | Purpose |
|-------------|------|---------|
| **SND API** | `apps/snd-api` | JSON store, auth token, BO read/write (admin-guarded), field visits |
| **SND Web** | `apps/snd-web` | React (Vite): **Back Office** + **Field** web shells |
| **SND Mobile** | `apps/mobile` | Expo Router: **Field** agent UI (tabs: Field, Supervise) — largely demo/mock |
| **Static folder (optional)** | `static/` | Plain files only — served by **`scripts/serve-static.ps1`** (PowerShell, no Node). Default URL `http://127.0.0.1:3000/`. |

**Run (from repo root):** `npm install` then `npm run mvp` starts API (`:4000`) + Web (`:3000`). Mobile: `npm run mobile`.

**Static only:** `npm run serve:static` or `.\scripts\START-STATIC.cmd` or `cd` to repo root and `powershell -File .\scripts\serve-static.ps1` (serves `static/`).

---

## 2. User model: workspaces and roles

### 2.1 Workspaces

| Workspace | Meaning | Typical entry (web) |
|-----------|---------|---------------------|
| **bo** | Back Office — configuration and oversight | `/bo/dashboard` |
| **agent** | Field — execution, visits | `/field` |

### 2.2 Role keys (`roleKey`)

Roles are **orthogonal to workspace** in the type system, but **seed users** pair them so BO users use `bo` and agents use `agent`.

| Role key | Role title (example) | Default workspace in seed | Notes |
|----------|----------------------|----------------------------|--------|
| **ADMIN** | Administrator | `bo` | Full BO module access; **only role** allowed to call mutating BO APIs |
| **TDR** | Territory Development Rep | `bo` | BO: dashboard, users, territory, analytics |
| **ZBM** | Zonal Business Manager | `bo` | BO: dashboard, users, targets, analytics |
| **DSA** | Direct Sales Agent | `agent` | Field app; no BO sidebar modules |

### 2.3 Demo employee IDs (seed / client demo login)

Aligned with `apps/snd-api/data/seed.json` and `apps/snd-web/src/lib/session.ts`:

| Employee ID | Workspace | Role |
|-------------|-----------|------|
| `ADMIN-101` | bo | ADMIN |
| `TDR-101` | bo | TDR |
| `ZBM-101` | bo | ZBM |
| `SBM-101` | bo | ZBM |
| `DSA-101` | agent | DSA |
| `AGENT-101` | agent | DSA |

---

## 3. Back Office modules (SND Web — `/bo/...`)

These are the **sidebar modules** in `apps/snd-web`. Route segment = module name.

| Module | Route | What it covers (product intent) |
|--------|-------|----------------------------------|
| **Dashboard** | `/bo/dashboard` | Summary KPIs, leaderboard snapshot, exceptions, float alerts (from API when connected) |
| **Hierarchy** | `/bo/hierarchy` | Organisation tree (CSDO → … → DSA); **ADMIN** can add/rename/reorder/delete leaves via API |
| **Users & agents** | `/bo/users` | Directory (path, codes, KYC, beat); **ADMIN** CRUD via API |
| **Territory** | `/bo/territory` | Coverage summary + beat roster; **ADMIN** can PATCH via API |
| **KPI engine** | `/bo/kpis` | Metric definitions (unit, frequency, formula); **ADMIN** add/edit/delete via API |
| **Targets** | `/bo/targets` | Current campaign roll-down; **ADMIN** can PATCH campaign/rows via API |
| **Incentives** | `/bo/incentives` | Slab / bonus plans (read from API; **no mutate API** in this MVP) |
| **Roles & RBAC** | `/bo/roles` | Policy matrix table (read from API; **UI does not change live RBAC** — navigation rules are code) |
| **Analytics** | `/bo/reports` | Heatmap + trend charts + full leaderboard (from API) |

### 3.1 Which BO modules each role can open (navigation)

Enforced in `apps/snd-web/src/lib/rbac.ts` (sidebar + route guard).

| Module | ADMIN | TDR | ZBM | DSA (BO) |
|--------|:-----:|:---:|:---:|:--------:|
| Dashboard | ✓ | ✓ | ✓ | — |
| Hierarchy | ✓ | — | — | — |
| Users & agents | ✓ | ✓ | ✓ | — |
| Territory | ✓ | ✓ | — | — |
| KPI engine | ✓ | — | — | — |
| Targets | ✓ | — | ✓ | — |
| Incentives | ✓ | — | — | — |
| Roles & RBAC | ✓ | — | — | — |
| Analytics | ✓ | ✓ | ✓ | — |

`DSA` has **no** BO routes; field users are redirected away from `/bo/*`.

### 3.2 Write access vs read-only (current behaviour)

- **API mutations** (org tree, users, KPIs, targets, territory) require **BO session + `roleKey === "ADMIN"`** (403 otherwise).
- **TDR / ZBM** see allowed modules but **cannot** persist BO configuration changes through the API in this build.
- **Incentives** and **RBAC** pages are **read-only** in the UI; incentives have **GET only** on the API.

---

## 4. Field modules (SND Web — `/field`)

| Area | Route | Purpose |
|------|-------|---------|
| **Field home** | `/field` | Agent-oriented home (demo content) |
| **Visit** | `/field/visit` | Visit capture UI; can submit visits to **POST `/api/field/visits`** when API is enabled |

**Visits listing:** **GET `/api/field/visits`** — agents see own visits; BO users see all (when implemented in API).

---

## 5. Field app (SND Mobile — Expo)

| Tab / screen | Purpose |
|--------------|---------|
| **Field** (`(tabs)/index`) | Agent home, tasks carousel, outlets → visit |
| **Supervise** | TL-style demo screen |
| **Visit** (`visit/[id]`) | Outlet visit form (demo; submit is UI-level alert in current demo) |

Mobile is **not** fully unified with the API in this MVP; treat it as **UX shell + mock**.

---

## 6. API surface (high level)

| Area | Examples |
|------|----------|
| **Auth** | `POST /api/auth/login`, `GET /api/auth/me` |
| **BO reads** | `GET /api/bo/dashboard`, `org-tree`, `users`, `kpis`, `targets/current`, `incentives`, `rbac`, `territory`, `reports` |
| **BO writes (ADMIN)** | Org tree CRUD + move; users CRUD; KPIs CRUD; targets PATCH; territory PATCH |
| **Field** | `POST /api/field/visits`, `GET /api/field/visits` |
| **Health** | `GET /api/health` |

---

## 7. Is it “done”?

**No** — this is a **coherent MVP demo**, not a finished product.

Reasonable “done for now” scope:

- Single **web** product path: **SND Web + SND API** with role-based BO navigation and **ADMIN** configuration for core BO entities.
- **Field** web visits API path exists; **mobile** is primarily demonstration UI.

Gaps you may still want on the roadmap: incentives/RBAC **persistence**, **TL** as a distinct role, **production auth**, **real RBAC engine** (not hardcoded route map), mobile **full API parity**, audits, approvals, etc.

---

*Last aligned with repo layout: Back Office modules from `BoSidebar.tsx` / `rbac.ts`; roles from `session.ts` + `seed.json`.*
