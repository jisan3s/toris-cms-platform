# Toris CMS Platform

Full-stack CMS-driven agency website with Owner/Admin dashboards, dynamic content sections, user auth, and contact submission queue processing.

## Repository

- Suggested repo name: `toris-cms-platform`
- Current GitHub: `https://github.com/jisan3s/toris-cms-platform.git`

## Tech Stack

- Frontend: Angular 21
- Backend: Node.js + Express 5
- Database: MongoDB Atlas
- Media Uploads: Cloudinary
- Email: Gmail SMTP (App Password)
- Testing: Node test runner + Playwright (E2E scaffolding)

## Project Structure

- `toris-frontend/`: public website + auth pages + owner/admin dashboards
- `toris-backend/`: API server, auth, CMS logic, queue worker, DB models
- `toris-backend/data/api-export/`: exported Mongo API data snapshot (JSON)

## Key Features

- CMS-managed page sections across public routes
- Owner dashboard:
- Admin account management
- User account management
- Contact submissions management
- User auth:
- Register/Login
- Forgot/Reset password (token-based)
- Refresh token + session storage
- Optional email verification gate (`USER_EMAIL_VERIFY_REQUIRED`)
- Contact pipeline:
- Form saves submission to DB
- Async email queue worker
- Retry + dead-letter status
- Ops:
- Request ID logging
- Health and readiness endpoints

## Local Development Setup

### 1. Clone

```bash
git clone https://github.com/jisan3s/toris-cms-platform.git
cd toris-cms-platform
```

### 2. Backend Setup

```bash
cd toris-backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5001` by default.

### 3. Frontend Setup

```bash
cd ../toris-frontend
npm install
npm start
```

Frontend runs on `http://localhost:4200` by default.

## Environment Variables (Backend)

Start from [toris-backend/.env.example](/Users/envytheme/AA%20Practice%20Projects/toris/toris-backend/.env.example).

Critical values:

- `MONGO_URI`
- `JWT_SECRET`
- `USER_JWT_SECRET`
- `USER_REFRESH_JWT_SECRET`
- `OWNER_EMAIL`, `OWNER_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`
- `CONTACT_FROM_EMAIL`, `CONTACT_NOTIFY_TO`

## MongoDB Atlas Data Export/Restore

This project already includes exported API data in:

- [toris-backend/data/api-export](/Users/envytheme/AA%20Practice%20Projects/toris/toris-backend/data/api-export)

### Export current Atlas API data

```bash
cd toris-backend
npm run export:api-data
```

This reads from `MONGO_URI` and writes JSON snapshots into `data/api-export/`.

### Restore API data into MongoDB Atlas

```bash
cd toris-backend
npm run restore:api-data -- --replace
```

Important restore behavior:

- `--replace` is required (safety switch).
- It clears these collections before restore:
- `aboutcontents`
- `cmscontents`
- `sitesections`
- `contactsubmissions`
- `emailjobs`
- Then inserts documents from `data/api-export/*.json`.

Use this only when you intentionally want to overwrite target data.

## Common Scripts

### Backend (`toris-backend`)

- `npm run dev`: start backend with nodemon
- `npm start`: start backend (node)
- `npm run lint`: eslint + syntax checks
- `npm test`: backend tests
- `npm run export:api-data`: export Atlas snapshot
- `npm run restore:api-data -- --replace`: restore snapshot to DB

### Frontend (`toris-frontend`)

- `npm start`: run Angular dev server
- `npm run build`: production build
- `npm run lint`: eslint + typecheck + template checks
- `npm run e2e:list`: list Playwright E2E tests
- `npm run e2e`: run Playwright tests

## API Health Endpoints

- `GET /health`
- `GET /ready`

## Security and Secrets

- `.env` is ignored by git.
- `.env.example` is committed as placeholder template only.
- Never commit real secrets.
- Rotate secrets if they were ever shared.
- For production, use a secret manager (not files).

## Troubleshooting

- CORS blocked:
- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend origin exactly.
- Contact email not sending:
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` (Google App Password, not normal password).
- Atlas export/restore fails:
- Verify `MONGO_URI` and IP/network access from current machine.

## License

Private/Internal project.
