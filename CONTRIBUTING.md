# Contributing

## Workflow

1. Create a branch from `main`.
2. Keep changes scoped to one feature/fix.
3. Run checks locally before opening PR.
4. Open a PR with clear summary, scope, and test notes.

## Branch Naming

- `feature/<short-topic>`
- `fix/<short-topic>`
- `chore/<short-topic>`

## Commit Message

Use imperative style:

- `Add owner contact submission filters`
- `Fix token refresh handling in auth service`

## Local Validation

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
npm run e2e:list
```

## Pull Request Checklist

- [ ] Change is tested locally
- [ ] No secrets or credentials committed
- [ ] Docs updated if behavior/config changed
- [ ] Backward compatibility considered
- [ ] Screenshots/logs attached for UI/ops changes

## Security Issues

Do not open public issues for sensitive vulnerabilities.
Follow `SECURITY.md`.
