# Deployment

## Mandatory

- Configure all env vars in secret manager
- Never deploy with placeholder credentials
- Use strict `CORS_ALLOWED_ORIGINS`

## Pre-deploy checks

### Backend

```bash
cd toris-backend
npm run lint
npm test
```

### Frontend

```bash
cd toris-frontend
npm run lint
npm run build
```

## Health checks

- `GET /health`
- `GET /ready`
