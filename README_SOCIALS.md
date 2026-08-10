# Social Feeds Setup

This project supports pulling social posts (and like/share counts) from multiple providers. Use the instructions below to configure API keys and seed demo content.

Environment variables
- `X_BEARER_TOKEN` — Twitter/X API Bearer Token (for v2 endpoints). Create a developer app and generate a Bearer token.
- `FACEBOOK_PAGE_ACCESS_TOKEN` — Facebook Graph API Page Access Token (v17.0). Create a Facebook App, obtain a Page token with `pages_read_engagement` and `pages_read_user_content` scopes.
- `LINKEDIN_ACCESS_TOKEN` — LinkedIn API access token for organization shares. Use OAuth or a server-side token with `r_organization_social`/`rw_organization_admin` scopes.

YouTube
- Public channel feeds are fetched via the Atom feed at `https://www.youtube.com/feeds/videos.xml?channel_id=...`. No API key required for basic video lists.

Seeding demo data (no API keys)
1. Run the demo seed script to populate `SiteSettings.socials` with example links and demo posts:

```bash
node scripts/seed-demo-socials.js
```

2. Restart the dev server and visit the homepage. The Social section will display demo posts if no provider keys are available.

Notes
- For production use, set the environment variables above and restart the server.
- Twitter/X rate limits and access levels may require applying for elevated access.
- Instagram Graph API requires a Business account and App token — not implemented in demo.
