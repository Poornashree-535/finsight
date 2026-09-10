# FinSight – AI-Powered Personal Financial Intelligence Platform
## Copilot Project Instructions

> Place this file at `.github/copilot-instructions.md` in the repo root.
> GitHub Copilot (Chat and inline suggestions) will automatically use this
> as context for the whole workspace in VS Code.

---

## 1. Project Overview

FinSight is a full-stack personal finance platform that goes beyond basic
expense tracking. It imports transactions (CSV or manual entry), auto-
categorizes spending, detects recurring subscriptions, computes a Financial
Health Score, forecasts budgets, tracks savings goals, and generates
AI-powered insights via the Gemini API.

Build this as a **production-quality software project**, not a college
CRUD demo: clean module boundaries, typed code, tested endpoints, migrations,
and Docker/CI from the start.

---

## 2. Tech Stack

**Frontend**
- React + TypeScript
- Tailwind CSS
- React Router
- Recharts (charts/analytics)

**Backend**
- FastAPI (Python)
- SQLAlchemy (ORM)
- Pydantic (schemas/validation)
- Alembic (migrations)

**Database**
- PostgreSQL (local Postgres for dev, Supabase for prod)

**AI**
- Gemini API for financial insights (used narrowly — insights and
  forecasting, not a general chatbot)

**Deployment**
- Frontend → Vercel
- Backend → Render
- DB → Supabase Postgres

**Tooling**
- Docker + docker-compose for local dev parity
- GitHub Actions for CI (lint, test, build)
- pytest for backend tests
- Swagger/OpenAPI auto-docs (built into FastAPI)

---

## 3. Repository Structure

```
FinSight/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/      # API client calls
│   │   └── assets/
│   └── public/
├── backend/
│   ├── app/
│   │   ├── api/            # route handlers, grouped by resource
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # business logic (categorization, scoring, AI)
│   │   ├── database/        # session/engine setup
│   │   ├── utils/
│   │   ├── middleware/
│   │   ├── core/             # config, settings
│   │   └── main.py
│   ├── tests/
│   └── migrations/           # Alembic
├── docs/
│   ├── ERD.png
│   ├── API.md
│   └── Architecture.md
├── docker-compose.yml
└── README.md
```

**Convention:** keep route handlers thin — validate input, call a service
function, return the response. Business logic (categorization rules,
health-score formula, subscription detection) lives in `app/services/`,
not in the route file.

---

## 4. MVP Scope (build this first)

Do **not** build features outside this list until the MVP is complete and
deployed:

- Transactions: CRUD, search, filter, sort, pagination
- CSV import: parse, detect duplicates, auto-categorize
- Budget planner: per-category monthly limits + threshold warnings
- Dashboard: balance, income, expenses, savings, health score, trend charts
- Analytics: income vs expense, category breakdown, monthly trend, cash flow
- Subscription detection: flag recurring charges (Netflix, Spotify, etc.)
- Financial Health Score (weighted formula — see section 6)
- Savings goal planner: target amount + deadline → required monthly savings
- AI insights: 3–5 well-chosen Gemini-generated observations, not open chat

**Deferred (post-MVP, do not build yet):**
Financial Digital Twin / "what-if" simulator, OCR receipt scanning, voice
logging, multi-currency, family budget sharing, Open Banking/UPI sync,
mobile app.

---

## 5. Database Schema (core tables)

```
Users            (id, email, created_at)
Transactions     (id, user_id, amount, category_id, description, date, type)
Categories       (id, name, is_default)
Budgets          (id, user_id, category_id, monthly_limit)
Goals            (id, user_id, name, target_amount, deadline, current_amount)
Subscriptions    (id, user_id, merchant, amount, frequency, next_due_date)
FinancialScores  (id, user_id, score, breakdown_json, computed_at)
AIReports        (id, user_id, insight_text, generated_at)
Notifications    (id, user_id, message, type, read, created_at)
ImportHistory    (id, user_id, filename, imported_at, row_count)
```

Use Alembic migrations for every schema change — never hand-edit the DB.

---

## 6. Financial Health Score Formula

Weighted score out of 100:

| Metric             | Weight |
|---------------------|--------|
| Savings Rate         | 30%    |
| Budget Adherence     | 25%    |
| Emergency Fund        | 15%    |
| Expense Stability    | 15%    |
| Goal Progress          | 15%    |

Bands: 85–100 Excellent · 70–84 Good · 50–69 Average · below 50 Poor.
Implement this in `app/services/health_score.py` as a pure function that
takes a user's financial snapshot and returns `(score, breakdown_dict)`.

---

## 7. API Design Conventions

- REST, versioned under `/api/v1/`
- Auth endpoints: `/api/v1/auth/register`, `/login`
- Resource endpoints: `/api/v1/transactions`, `/budgets`, `/goals`,
  `/subscriptions`, `/insights`, `/dashboard`
- All protected routes require `Authorization: Bearer <JWT>`
- Use Pydantic schemas for every request/response — no raw dicts
- Return consistent error shape: `{ "detail": "message" }`
- Paginate list endpoints with `?page=&page_size=`
- Rate-limit auth endpoints

---

## 8. Coding Conventions

- Python: type hints everywhere, `black` + `ruff` for formatting/linting
- TypeScript: strict mode on, no `any` unless justified with a comment
- Every service function in the backend gets a corresponding test in
  `backend/tests/`
- Environment variables via `.env` (never commit secrets) — use
  `app/core/config.py` (Pydantic `BaseSettings`) to load them
- Commit style: small, meaningful commits per feature/module (this repo
  should read as an engineering history, not one giant upload)

---

## 9. Build Order (for Copilot Chat session planning)

1. Repo scaffold + Docker Compose (Postgres + backend + frontend)
2. Database models + Alembic migrations
3. Auth (register/login/JWT)
4. Transaction CRUD API + basic frontend list/form
5. CSV import + categorization service
6. Budget planner + warnings
7. Dashboard + analytics endpoints + Recharts frontend
8. Subscription detection
9. Financial Health Score
10. Goal planner
11. Gemini AI insights service
12. Tests, GitHub Actions CI, deployment configs

When asking Copilot Chat for help, reference the specific module/service by
its path (e.g. "implement `app/services/categorization.py`") so it uses this
file's conventions rather than generic scaffolding.
