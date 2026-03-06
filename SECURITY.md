# Security Policy

## Supported Versions

Security fixes are prioritized on the latest `main` branch.

## Reporting a Vulnerability

Do not disclose vulnerabilities in public issues.

Report privately with:

- Vulnerability summary
- Reproduction steps
- Affected area
- Potential impact
- Suggested mitigation (optional)

## Response Process

1. Acknowledge report.
2. Reproduce and triage severity.
3. Prepare and test fix.
4. Release patch and disclosure notes.

## Secrets Handling

- Never commit credentials or tokens.
- Use `.env.example` placeholders only.
- Use a secrets manager in deployment environments.
