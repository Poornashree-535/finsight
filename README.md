# FinSight

FinSight is a personal financial intelligence platform with a FastAPI backend, React frontend, and PostgreSQL database.

## Tech stack

- Frontend: React, TypeScript, Tailwind CSS, React Router, Recharts
- Backend: FastAPI, SQLAlchemy, Pydantic, Alembic
- Database: PostgreSQL

## Project structure

```text
.
├── backend
├── frontend
├── docs
└── docker-compose.yml
```

## Local setup (Docker)

1. Copy `.env.example` to `.env`.
2. Run:

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Postgres: localhost:5432

## Local setup (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Current MVP baseline

- Dashboard with financial overview
  - Balance, income, expenses, health score cards
  - Category breakdown pie chart
- Health endpoint:
  - `GET /api/v1/health`
- Initial SQLAlchemy models for core finance tables
- Initial Alembic migration with core schema

**Note:** Authentication has been removed. The app loads directly to the dashboard.
