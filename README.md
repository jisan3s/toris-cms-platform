# Toris CMS Platform

A full-stack CMS-driven agency website with Owner/Admin dashboards, dynamic page content management, auth flows, and contact submission queue processing.

## Tech Stack

- Frontend: Angular 21
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Media: Cloudinary
- Email: Gmail SMTP (App Password)

## Monorepo Structure

- `toris-frontend/` - Angular app (public site + dashboards)
- `toris-backend/` - Express API, auth, CMS, queue worker

## Features

- CMS-managed page sections
- Owner/Admin account management
- User auth (register/login/forgot/reset)
- Refresh token + session model
- Contact form save + async email queue (retry/dead-letter)
- Request ID logging, health/readiness endpoints

## Setup

### 1. Clone

```bash
git clone https://github.com/<your-username>/toris-cms-platform.git
cd toris-cms-platform
```

### 2. Backend

```bash
cd toris-backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend

```bash
cd ../toris-frontend
npm install
npm start
```

## Environment

Configure backend `.env` with:

- `MONGO_URI`
- `JWT_SECRET`
- `USER_JWT_SECRET`
- `USER_REFRESH_JWT_SECRET`
- `OWNER_EMAIL`, `OWNER_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_FROM_EMAIL`, `CONTACT_NOTIFY_TO`

## Scripts

### Backend

- `npm run dev`
- `npm run lint`
- `npm test`

### Frontend

- `npm start`
- `npm run lint`
- `npm run build`
- `npm run e2e:list`

## Health Endpoints

- `GET /health`
- `GET /ready`

## Security Notes

- Never commit `.env`
- Use strong secrets
- Rotate exposed credentials immediately
- Use production secret manager for deployment

## License

Private/Internal
