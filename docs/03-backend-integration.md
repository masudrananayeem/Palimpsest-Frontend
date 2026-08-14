# Backend Integration Plan

The current frontend is intentionally local-first. A future backend can provide:

- `GET /api/artifacts`
- `GET /api/artifacts/:id`
- `GET /api/collections`
- `GET /api/documents`
- `GET /api/research-notes?artifactId=:id`
- `POST /api/research-notes`
- `POST /api/reviews`
- `GET /api/audit-log`

Recommended stack: Node.js + Express, PostgreSQL or MongoDB, object storage for scans, and signed URLs for large 3D assets.
