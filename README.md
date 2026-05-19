# WebGate

WebGate is an intentionally vulnerable, Docker-contained web app built to look like a real internal customer portal. It is meant for local reverse-proxy and WAF-defense practice.

## Run

```bash
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

The traffic dashboard runs as a React/Vite container on the same Docker network:

```text
http://localhost:5173
```

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@webgate.local` | `admin123` |
| Manager | `maya@webgate.local` | `maya2026` |
| User | `sam@client.example` | `sam123` |

## Intentional Vulnerabilities

This application is intentionally unsafe. Keep it isolated and do not expose it to the public internet.

- SQL injection in login and customer search.
- Reflected XSS in the search page.
- Stored XSS in support ticket comments.
- IDOR in invoice viewing.
- Path traversal in document downloads.
- Command injection in the admin diagnostic tool.
- Weak unsigned session cookie.
- Verbose headers and debug endpoint leakage.

## Reverse Proxy Defense Ideas

- Block traversal patterns like `../` and encoded equivalents.
- Add strict response security headers.
- Normalize duplicate slashes and encoded paths.
- Restrict admin routes by source IP or authentication layer.
- Rate-limit login and diagnostics.
- Add request body and query-string inspection.
- Block shell metacharacters on high-risk endpoints.
