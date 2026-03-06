# Toris Project Control Manual

This document is the central operations guide for the full Toris system.

- Frontend app: `toris-frontend`
- Backend API: `toris-backend`
- Database: MongoDB

Use this file as the source of truth for dashboard operations, role access, content management, and API behavior.

## 1. System Overview

The project has 3 access layers:

1. Owner
- Full control of admin accounts and content.
- Logs in from `/owner/login`.
- Dashboard routes under `/owner/dashboard/*`.

2. Admin (created by Owner only)
- Logs in from `/admin/login`.
- Can manage only content allowed by assigned permissions.
- Dashboard routes under `/admin/dashboard/*`.

3. User
- Registers/logs in from public site routes.
- Uses `/user/dashboard`.

## 2. Environment Configuration

Backend `.env` requires:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
USER_JWT_SECRET=optional_user_jwt_secret

OWNER_NAME=Owner
OWNER_EMAIL=owner@toris.com
OWNER_PASSWORD=your_owner_password

# Cloudinary upload (Dashboard image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=toris
```

Notes:
- Owner account is auto-bootstrapped on backend startup using `OWNER_*`.
- Admin login is only for records with:
  - `role = "admin"`
  - `createdByOwner = true`
  - `isBlocked = false`
- Cloudinary credentials are required for file uploads from Owner/Admin dashboards.

## 3. Run Instructions

### Backend
```bash
cd toris-backend
npm install
npm run dev
```

### Frontend
```bash
cd toris-frontend
npm install
npx ng serve
```

### Deployment Check (Before Production)

Backend:
```bash
cd toris-backend
npm run deploy:check
npm run deploy:check:strict
```

Frontend:
```bash
cd toris-frontend
npm run deploy:check
npm run deploy:check:strict
npm run deploy:check:strict:prod
```

Strict mode is intended for production readiness and fails on local/dev values.
For frontend strict mode, required runtime values are:
- `NODE_ENV=production`
- `TORIS_API_ORIGIN=https://api.yourdomain.com`
- `PORT=4000` (or your deploy port)

### Secrets Ops

Backend secret hygiene:
```bash
cd toris-backend
npm run secrets:check
npm run secrets:rotate
npm run secrets:rotate:all
npm run secrets:ops
```

Meaning:
- `secrets:check`: validates secret presence and strength (JWT, owner password, Atlas URI, Cloudinary values).
- `secrets:rotate`: rotates `JWT_SECRET` and `USER_JWT_SECRET`.
- `secrets:rotate:all`: rotates JWT secrets + `OWNER_PASSWORD` (prints new owner password).
- `secrets:ops`: runs secrets check + backend deployment check.

External provider rotations (manual):
1. MongoDB Atlas:
- Rotate DB user password.
- Update `MONGO_URI` in backend `.env`.
2. Cloudinary:
- Rotate `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- Update backend `.env`.
3. Restart backend after any rotation:
```bash
cd toris-backend
npm run dev
```

Default URLs:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:5001`

## 4. Dashboard Routes

### Owner Dashboard
- `/owner/dashboard` (overview + admin management)
- `/owner/dashboard/home`
- `/owner/dashboard/pages/about`
- `/owner/dashboard/pages/contact`
- `/owner/dashboard/pages/faq`
- `/owner/dashboard/pages/pricing`
- `/owner/dashboard/pages/testimonials`
- `/owner/dashboard/pages/team`
- `/owner/dashboard/pages/careers`
- `/owner/dashboard/pages/terms`
- `/owner/dashboard/pages/privacy`
- `/owner/dashboard/pages/global`

### Admin Dashboard
- `/admin/dashboard/home`
- `/admin/dashboard/pages/about`
- `/admin/dashboard/pages/contact`
- `/admin/dashboard/pages/faq`
- `/admin/dashboard/pages/pricing`
- `/admin/dashboard/pages/testimonials`
- `/admin/dashboard/pages/team`
- `/admin/dashboard/pages/careers`
- `/admin/dashboard/pages/terms`
- `/admin/dashboard/pages/privacy`
- `/admin/dashboard/pages/global`

### User Dashboard
- `/user/dashboard`

## 5. Role and Permission Model

### Owner
- Full access to all content sections and all admin accounts.
- Permission set is full by default.

### Admin
Permissions object:

```json
{
  "home": true,
  "about": false,
  "blog": false,
  "services": false,
  "projects": false
}
```

Meaning:
- `home`: can manage home content APIs
- `about`: can manage about content APIs
- `blog`: can manage blog CMS entries
- `services`: can manage services CMS entries
- `projects`: can manage projects CMS entries

## 6. Owner Workflows

### A) Login as Owner
1. Go to `/owner/login`.
2. Use credentials from backend `.env` (`OWNER_EMAIL`, `OWNER_PASSWORD`).

### B) Create Admin
1. Open `/owner/dashboard`.
2. Fill name, email, password.
3. Select permissions.
4. Click Create Admin.

### C) Manage Admin
Owner can:
- Edit name/email
- Change permission checkboxes
- Block/unblock admin
- Delete admin

Blocked admins cannot log in.

## 7. Admin Workflows

1. Owner creates admin account first.
2. Admin logs in at `/admin/login`.
3. Admin lands in `/admin/dashboard/home`.
4. Admin can access content pages according to assigned permissions.
5. Unauthorized API actions return `403`.

## 8. Content Management Structure

Non-CMS homepage content is managed via a unified schema:
- `GET /api/owner/content/home`
- `PUT /api/owner/content/home`

Non-CMS page sections are managed per page/section via:
- `GET /api/owner/content/sections?page=<page>`
- `PUT /api/owner/content/sections/:page/:section`

Managed non-CMS pages:
- `about`
- `contact`
- `faq`
- `pricing`
- `testimonials`
- `team`
- `careers`
- `terms`
- `privacy`
- `global` (shared layout content)

Global content sections:
- `header` (brand + dynamic navbar items list with add/remove support)
- `footer` (title + subtitle + copyright)

CMS content (separate from the new page editors) is still managed by type:
- `blog`
- `services`
- `projects`

Public content reads from:
- `/api/content/:page`
- `/api/home/banner` (compatibility endpoint; uses same unified Home hero data source)

## 9. API Reference

Base URL: `http://localhost:5001`

### 9.1 Owner Auth

#### POST `/api/owner/auth/login`
Request:
```json
{
  "email": "owner@toris.com",
  "password": "owner_password"
}
```
Response:
```json
{
  "message": "Owner login successful",
  "token": "jwt_token",
  "owner": {
    "id": "owner_id",
    "name": "Owner",
    "email": "owner@toris.com"
  }
}
```

### 9.2 Admin Auth

#### POST `/api/admin/auth/login`
Only owner-created and active admins can log in.

Request:
```json
{
  "email": "admin@toris.com",
  "password": "admin_password"
}
```
Response:
```json
{
  "message": "Admin login successful",
  "token": "jwt_token",
  "admin": {
    "id": "admin_id",
    "name": "Admin Name",
    "email": "admin@toris.com",
    "role": "admin",
    "permissions": {
      "home": true,
      "about": false,
      "blog": true,
      "services": false,
      "projects": false
    }
  }
}
```

### 9.3 Owner Admin Management APIs
Authorization: `Bearer <owner_token>`

#### GET `/api/owner/admins`
Returns all owner-created admins.

#### POST `/api/owner/admins`
Request:
```json
{
  "name": "Content Manager",
  "email": "content@toris.com",
  "password": "TempPass123!",
  "permissions": {
    "home": true,
    "about": true,
    "blog": true,
    "services": false,
    "projects": false
  }
}
```

#### PUT `/api/owner/admins/:id`
Request:
```json
{
  "name": "Updated Name",
  "email": "updated@toris.com",
  "permissions": {
    "home": true,
    "about": false,
    "blog": true,
    "services": true,
    "projects": false
  }
}
```

#### PATCH `/api/owner/admins/:id/block`
Request:
```json
{
  "isBlocked": true
}
```

#### DELETE `/api/owner/admins/:id`
Response:
```json
{
  "message": "Admin deleted successfully"
}
```

### 9.4 Content Management APIs (Owner/Admin with permission)
Authorization: `Bearer <owner_or_admin_token>`

#### GET `/api/owner/content/home`
Response includes:
- `hero`
- `sections.clients`
- `sections.about-preview`
- `sections.why-choose`
- `sections.testimonials`
- `sections.pricing`
- `sections.cta`

#### PUT `/api/owner/content/home`
Request:
```json
{
  "hero": {
    "title": "Welcome",
    "subtitle": "We build digital products",
    "description": "Agency description",
    "buttonText": "Start Now",
    "buttonLink": "/contact",
    "image": "/images/hero.png"
  },
  "sections": {
    "clients": { "title": "Trusted by..." },
    "about-preview": {
      "heading": "About Heading",
      "description": "About short text",
      "buttonText": "Learn More"
    },
    "why-choose": {
      "yearsExperience": "10+",
      "projectsCompleted": "300+",
      "clientSatisfaction": "95%"
    },
    "testimonials": { "heading": "Client Reviews" },
    "pricing": { "heading": "Pricing Plans" },
    "cta": {
      "title": "Ready to grow?",
      "buttonText": "Contact Us"
    }
  }
}
```

#### GET `/api/owner/content/about`

#### PUT `/api/owner/content/about`
Request:
```json
{
  "heading": "About Us",
  "subheading": "Who we are",
  "body": "Long about content",
  "image": "/images/about.jpg"
}
```

#### GET `/api/owner/content/:type`
`:type` must be one of `blog | services | projects`.

#### POST `/api/owner/content/:type`
Request:
```json
{
  "title": "Post title",
  "summary": "Summary text",
  "status": "Draft"
}
```

#### PUT `/api/owner/content/:type/:id`

#### DELETE `/api/owner/content/:type/:id`

#### GET `/api/owner/content/sections?page=home`
Returns site sections for a page.

#### PUT `/api/owner/content/sections/:page/:section`
Request:
```json
{
  "data": {
    "key": "value"
  }
}
```

#### GET `/api/owner/content/media/config`
Returns dashboard upload capability info.

#### POST `/api/owner/content/media/upload`
Uploads a base64 image to Cloudinary and returns a URL.

Request:
```json
{
  "fileDataUrl": "data:image/png;base64,...",
  "folder": "home/hero"
}
```

Response:
```json
{
  "message": "Image uploaded successfully",
  "secureUrl": "https://res.cloudinary.com/.../image/upload/...png",
  "publicId": "toris/home/hero/..."
}
```

### 9.5 Public Content APIs

#### GET `/api/content/:page`
Example:
- `/api/content/home`
- `/api/content/about`

Response:
```json
{
  "page": "home",
  "sections": {
    "hero": {
      "title": "Welcome to Toris Agency"
    },
    "clients": { "title": "..." }
  }
}
```

#### GET `/api/home/banner`
Gets public hero/banner from the unified Home content storage.

### 9.6 Banner Update API (compatibility route)

#### PUT `/api/home/banner`
Authorization: Owner or Admin with Home access.

Request:
```json
{
  "title": "Banner title",
  "subtitle": "Banner subtitle",
  "description": "Banner description",
  "buttonText": "Read More",
  "buttonLink": "/about",
  "image": "/images/hero.png"
}
```
Note:
- This endpoint updates the same unified Home hero section used by `/api/content/home`.

### 9.7 User Auth + Dashboard APIs

#### POST `/api/auth/register`
```json
{
  "name": "User Name",
  "email": "user@site.com",
  "password": "secret123"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "user@site.com",
  "password": "secret123"
}
```

#### GET `/api/user/dashboard`
Authorization: `Bearer <user_token>`

## 10. Common Error Responses

```json
{ "message": "Not authorized, no token" }
```
```json
{ "message": "Not authorized, token failed" }
```
```json
{ "message": "Access denied for home content" }
```
```json
{ "message": "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET." }
```
```json
{ "message": "Your admin account is blocked" }
```

## 11. Existing Admin Migration (One-Time)

If you have old admin accounts created before `createdByOwner` rules:

Dry run:
```bash
cd toris-backend
npm run migrate:owner-admins -- --emails=admin1@toris.com,admin2@toris.com --permissions=home,about,blog
```

Apply:
```bash
npm run migrate:owner-admins -- --emails=admin1@toris.com,admin2@toris.com --permissions=home,about,blog --apply
```

## 12. Maintenance Rule (Keep this File Updated)

Whenever any of the following changes, update this manual in the same commit:

- API route paths
- Request/response payload shapes
- Auth/permission logic
- Dashboard route paths
- Content section names/structure
- New models or management workflows

Recommended process for each feature PR:

1. Implement code changes.
2. Update this file (`PROJECT_CONTROL_MANUAL.md`).
3. Verify example API payloads against controllers.
4. Include doc update in commit.

## 13. Quick Validation Checklist

After updates:

1. Owner login works.
2. Owner can create an admin with selected permissions.
3. Admin login works only for owner-created, unblocked admin.
4. Admin forbidden endpoints return `403`.
5. Public pages still load content from public APIs.
6. `npx ng build` passes in frontend.
7. Backend starts and connects to DB.
