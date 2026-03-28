# DataLens

DataLens is an AI-powered no-code analytics platform for uploading CSV or Excel files, cleaning messy data, generating charts, and asking an AI assistant questions about the dataset.

This repository includes:

- React 18 + Vite + Tailwind frontend
- Express backend with PostgreSQL-ready structure
- JWT-based authentication foundation
- analysis studio for cleaning and charting
- AI assistant for guided dataset Q&A
- demo mode for hackathon-friendly deployment without a database

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Recharts
- PapaParse
- XLSX
- Axios
- React Router

### Backend

- Node.js
- Express
- PostgreSQL via `pg`
- JWT auth with `jsonwebtoken`
- password hashing with `bcryptjs`

## Project Structure

```text
datalens/
├── src/                  # React app
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── .env.example
├── render.yaml
├── vercel.json
└── README.md
```

## Local Setup

### 1. Install frontend dependencies

```powershell
cd "C:\Users\ksaho\VS Code\Hackathon\datalens"
npm install
```

### 2. Install backend dependencies

```powershell
cd "C:\Users\ksaho\VS Code\Hackathon\datalens\server"
npm install
```

### 3. Add environment files

Create:

- `C:\Users\ksaho\VS Code\Hackathon\datalens\.env`
- `C:\Users\ksaho\VS Code\Hackathon\datalens\server\.env`

Suggested values:

```env
VITE_API_URL=http://localhost:4000/api
```

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/datalens
DEMO_MODE=true
JWT_SECRET=replace-this-with-a-strong-secret
```

## Run The Full App

From the project root:

```powershell
cd "C:\Users\ksaho\VS Code\Hackathon\datalens"
npm run dev
```

This starts:

- Vite frontend on `http://localhost:5173`
- Express backend on `http://localhost:4000`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Health

- `GET /api/health`

### Dashboard

- `GET /api/dashboard/overview`

### Datasets

- `GET /api/datasets`

### AI

- `POST /api/ai/insights`
- `POST /api/ai/chat`

## Deployment

Recommended setup:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render Postgres or Railway Postgres when you move past demo mode

### Frontend on Vercel

Root directory:

```text
/
```

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

Environment variable:

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

### Backend on Render

Use the included `render.yaml` or create a Web Service manually.

Settings:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm run start`

Environment variables:

```env
PORT=4000
CLIENT_URL=https://your-frontend-domain.vercel.app
DATABASE_URL=postgresql://...
DEMO_MODE=true
JWT_SECRET=replace-this-with-a-strong-secret
```

### Easiest Hackathon Deployment

For a quick submission:

1. Deploy frontend to Vercel
2. Deploy backend to Render
3. Keep `DEMO_MODE=true`
4. Do not require PostgreSQL for the demo

This keeps the app easy to show while preserving the production-ready backend structure.

## Current Status

Implemented:

- login and registration flow
- JWT session bootstrapping in the client
- protected backend API routes
- users, workspaces, and datasets schema foundation
- analysis studio
- server-backed AI workspace
- Express API foundation
- PostgreSQL-ready backend structure
- Excel upload support
- cleaned dataset export
- chart download
- advanced cleaning actions

Not yet implemented:

- persistent Postgres auth in production mode
- real file storage
- live OpenAI integration
- billing
- team collaboration
