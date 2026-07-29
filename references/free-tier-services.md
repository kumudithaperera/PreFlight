# Free-Tier Third-Party Service Suggestions

When a finding requires a third-party service (not fixable purely in code), suggest options with a genuinely usable free tier - this skill is aimed at solo developers and low-budget teams. Pricing/limits change often, so treat these as a starting shortlist to mention by name, not a guarantee - tell the user to confirm current limits before committing.

| Need | Free-tier options to suggest |
|---|---|
| Rate limiting / abuse protection | Cloudflare (free plan incl. basic rate limiting rules), Upstash Redis (free tier, good for rate-limit counters) |
| Bot/CAPTCHA protection | Cloudflare Turnstile (free), hCaptcha (free tier) |
| WAF / DDoS protection | Cloudflare (generous free plan) |
| Secrets management | `.env` + host's built-in secret storage (Vercel/Render/Railway/Fly.io all have free-tier env var storage) - Doppler also has a free tier if they want a dedicated tool |
| Payment processing | Stripe or Paddle - no monthly fee, pay-per-transaction only, so effectively free until they have revenue |
| Transactional email (for verification/reset links) | Resend (free tier), Mailgun (free tier), Amazon SES (very cheap, small free allotment) |
| File/object storage | Cloudflare R2 (free egress + free tier storage), Supabase Storage (free tier) |
| Managed database | Supabase (Postgres, free tier), Neon (Postgres, free tier), PlanetScale (MySQL, free tier depending on plan availability) |
| Error monitoring / logging | Sentry (free tier), Better Stack (free tier) |
| Full-text/product search | Meilisearch Cloud (free tier), Typesense Cloud (free tier) |
| Auth-as-a-service (if not rolling your own) | Clerk (free tier), Supabase Auth (free tier), Auth.js (open source, no service cost - just your own DB) |
| Webhook signature/testing tooling | Provider's own signing (Stripe, etc. - no extra service needed, just verify signatures) |

If nothing fits cleanly, say so rather than forcing a suggestion - not every need has a good free tier (e.g. SMS/OTP delivery tends to be the weakest here; mention that it's usually low-cost-per-message rather than free).
