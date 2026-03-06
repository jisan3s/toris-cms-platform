# Toris CMS Platform

Full-stack CMS-driven agency website with Owner/Admin dashboards, dynamic section management, CMS item management, user auth, and async contact email queue.

## Repository

- GitHub: `https://github.com/jisan3s/toris-cms-platform.git`
- Root folders:
- `toris-frontend` (Angular app)
- `toris-backend` (Express API + MongoDB logic)

## What This Project Controls

### Website Content Control (Dashboard)

Owner/Admin can control:

- Global header/footer content and links
- Public page sections for managed pages (about, contact, faq, pricing, services, testimonials, blog, portfolio, team, careers, terms, privacy)
- CMS item lists:
- Services
- Blog
- Portfolio
- Contact submission statuses (Owner overview)

### User/Admin Control

Owner can control:

- Admin account create/edit/block/delete
- User account block/delete
- Contact submission status (`new`, `read`, `archived`)

## Architecture Overview

### Frontend

- Framework: Angular 21
- Routing: `src/app/app.routes.ts`
- Owner content editor:
- Non-CMS pages: `src/app/pages/owner/dashboard/page-editor`
- CMS items: `src/app/pages/owner/dashboard/blog`
- API configs: `src/app/shared/config/api.ts`

### Backend

- Runtime: Node.js + Express 5
- DB: MongoDB Atlas via Mongoose
- Key routes:
- Public content: `routes/publicContentRoutes.js`
- User auth: `routes/authRoutes.js`
- Owner content: `routes/ownerContentRoutes.js`
- Owner admin/user/contact management:
- `routes/ownerAdminRoutes.js`
- `routes/ownerUserRoutes.js`
- `routes/ownerContactRoutes.js`

## Local Development Setup

### 1. Clone

```bash
git clone https://github.com/jisan3s/toris-cms-platform.git
cd toris-cms-platform
```

### 2. Backend

```bash
cd toris-backend
cp .env.example .env
npm install
npm run dev
```

Backend default: `http://localhost:5001`

### 3. Frontend

```bash
cd ../toris-frontend
npm install
npm start
```

Frontend default: `http://localhost:4200`

## Environment Variables (Backend)

Template: `toris-backend/.env.example`

Required core:

- `MONGO_URI`
- `JWT_SECRET`
- `USER_JWT_SECRET`
- `USER_REFRESH_JWT_SECRET`
- `OWNER_EMAIL`
- `OWNER_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

Contact/email:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `CONTACT_FROM_EMAIL`
- `CONTACT_NOTIFY_TO`

Queue and auth controls:

- `EMAIL_WORKER_POLL_MS`
- `EMAIL_WORKER_MAX_ATTEMPTS`
- `RESET_PASSWORD_TOKEN_TTL_MINUTES`
- `USER_EMAIL_VERIFY_REQUIRED`
- `USER_ACCESS_TOKEN_TTL`
- `USER_REFRESH_TOKEN_TTL`

## How To Control Content

### A) Manage Non-CMS Page Sections

- Dashboard route: Owner -> `Pages/...` editors
- Frontend section schema source:
- `toris-frontend/src/app/pages/owner/dashboard/page-editor/managed-pages.ts`
- Backend section validation source:
- `toris-backend/validators/siteSectionValidation.js`
- Section save API:
- `PUT /api/owner/content/sections/:page/:section`

If adding a new section field:

1. Add field in `managed-pages.ts`
2. Add corresponding schema in backend validator
3. Use the field in public page component/template

### B) Manage CMS Items (Services/Blog/Portfolio)

- Dashboard CMS editor:
- `toris-frontend/src/app/pages/owner/dashboard/blog`
- CMS form fields component:
- `toris-frontend/src/app/pages/owner/dashboard/blog/owner-cms-fields.ts`
- Backend CRUD:
- `toris-backend/controllers/owner/cmsController.js`
- Routes:
- `GET/POST/PUT/DELETE /api/owner/content/:type`

If adding a new CMS field:

1. Add form control in CMS editor frontend
2. Add field in payload normalization (`cmsController.js`)
3. Add field rendering in public page/detail component

### C) Header/Footer Global Navigation

- Managed in page editor under page key `global`, sections `header` and `footer`
- Data source on frontend via site-content service and `sections[...]` lookups

## How To Add A New Managed Page

1. Add public route in `toris-frontend/src/app/app.routes.ts`
2. Create page component/template in `src/app/pages/<page>`
3. Register page + sections in:
- `src/app/pages/owner/dashboard/page-editor/managed-pages.ts`
4. Add backend validation schema for new page/sections:
- `toris-backend/validators/siteSectionValidation.js`
5. Ensure page reads content from site sections API (no hardcoded content)

## Contact Form + Queue Flow

### Flow

1. Frontend submits contact form to:
- `POST /api/content/contact/submit`
2. Backend stores record in `contactsubmissions`
3. Backend enqueues email job in `emailjobs`
4. Worker (`workers/emailQueueWorker.js`) sends email
5. On failure, retries with backoff; final state -> `dead_letter`

### Owner Controls

- Owner overview can list submissions and change status
- APIs:
- `GET /api/owner/contact/submissions`
- `PATCH /api/owner/contact/submissions/:id/status`
- `GET /api/owner/contact/dead-letters`

## Auth System (Current)

- Register/Login/Forgot/Reset
- Refresh token + session persistence (`UserSession`)
- Logout revokes refresh session
- Password reset invalidates active sessions
- Optional email verification gate

Auth routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`

## MongoDB Atlas Export/Restore (Full)

Data snapshot folder:

- `toris-backend/data/api-export`

### Export from Atlas

```bash
cd toris-backend
npm run export:api-data
```

Exports collections:

- `aboutcontents`
- `cmscontents`
- `sitesections`
- `contactsubmissions`
- `emailjobs`

### Restore to Atlas

```bash
cd toris-backend
npm run restore:api-data -- --replace
```

Restore behavior:

- Requires `--replace`
- Deletes target collection data first
- Inserts documents from JSON snapshot files

## Scripts Reference

### Backend (`toris-backend`)

- `npm run dev`
- `npm start`
- `npm run lint`
- `npm test`
- `npm run export:api-data`
- `npm run restore:api-data -- --replace`
- `npm run deploy:check`
- `npm run secrets:check`

### Frontend (`toris-frontend`)

- `npm start`
- `npm run build`
- `npm run lint`
- `npm run e2e:list`
- `npm run e2e`

## Deployment Checklist

1. Set all production env vars in secret manager
2. Rotate all development/shared credentials
3. Set strict `CORS_ALLOWED_ORIGINS`
4. Set production Atlas URI with least-privilege user
5. Ensure health endpoints exposed:
- `GET /health`
- `GET /ready`
6. Run before deploy:
- Backend: `npm run lint && npm test`
- Frontend: `npm run lint && npm run build`

## Troubleshooting

### Dashboard content not updating

- Check API origin in frontend (`shared/config/api.ts`)
- Verify owner/admin token is present and valid
- Verify section keys match backend validator schema

### Contact form saves but no email

- Check Gmail env vars
- Verify Google app password is valid
- Inspect `emailjobs` for failed/dead-letter items

### CORS blocked

- Ensure exact frontend URL is in `CORS_ALLOWED_ORIGINS`
- Restart backend after env changes

### Atlas restore fails

- Confirm `MONGO_URI`
- Confirm network/IP access to Atlas cluster
- Confirm `--replace` flag used

## Security Notes

- `.env` must never be committed
- `.env.example` should contain placeholders only
- Rotate credentials immediately if exposed
- Use platform secret manager in production

## License

Private/Internal
