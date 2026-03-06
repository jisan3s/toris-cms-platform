# Data Snapshot Policy

This folder stores export snapshots used for reproducible setup and restore testing.

## Included Data

- `api-export/` JSON snapshots for API-facing collections

## Commands

Export from Atlas:

```bash
cd toris-backend
npm run export:api-data
```

Restore to target DB (destructive replace):

```bash
cd toris-backend
npm run restore:api-data -- --replace
```

## Safety Rules

- Do not store secrets in snapshot files.
- Do not commit regulated/private personal data unless policy allows it.
- Treat `restore --replace` as destructive to target collections.
