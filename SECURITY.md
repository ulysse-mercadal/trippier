# Security Policy

## Supported versions

Security fixes land on `main` and the most recent tagged release.

## Reporting a vulnerability

Do not open a public issue for security problems. Report privately via GitHub
Security Advisories:

https://github.com/ulysse-mercadal/trippier/security/advisories/new

Or email the maintainer at ulyssemercadal@kakao.com.

Please include:

- a description of the issue and its impact,
- steps to reproduce (a proof of concept if you have one),
- the affected area — `backend`, `frontend`, or `mobile`.

We aim to acknowledge reports within 72 hours and to ship a fix or mitigation
for confirmed issues as fast as is practical.

## Scope

In scope: JWT authentication and token handling (`backend`), password hashing,
SQL/Prisma injection, authorization bypass on maps/comments, secret leakage, and
handling of the MapTiler / GeoNames keys.

Out of scope: issues requiring an already-compromised host or physical access,
and the intentionally client-exposed `MAPTILER_*` values baked into the frontend
bundle.
