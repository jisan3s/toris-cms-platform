# Troubleshooting

## CORS blocked

- Ensure frontend origin exists in `CORS_ALLOWED_ORIGINS`.
- Restart backend after env updates.

## Gmail send failures

- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
- Confirm Google app password is active.

## Atlas connection issues

- Verify `MONGO_URI`.
- Check Atlas network access/IP allow list.

## Dashboard content not updating

- Verify owner/admin token is present.
- Verify section keys exist in validator schema.
