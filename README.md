# Mary's Automotive

Website, quote request dashboard and invoice tool for Mary's Automotive, Indianapolis.

Next.js (App Router) on Vercel, Supabase (Postgres, Auth, RLS) and Resend.

## Structure

| Path | What it is |
| --- | --- |
| `src/app/(site)` | Public marketing pages, statically generated |
| `src/app/admin` | Shop admin: login, quote requests dashboard, invoice tool |
| `src/app/api/quote` | Public quote form endpoint |
| `src/app/api/send-invoice` | Invoice email endpoint (admin only) |
| `src/content` | Business facts, services, FAQ, photos. Edit content here. |
| `supabase/migrations` | Database schema and RLS policies |

## Security model

* **Database:** RLS is on for every table. Anonymous users have no access. Signed in users can read or change data only if they are in `admin_users`. The dashboard may change a request's `status` only (column grant). Notes are insert only.
* **Public quote form:** validated with zod on the server, then a honeypot field, a minimum fill time and Postgres backed IP rate limits. Rows are inserted with the service role key, which never reaches the browser. If the database is down, the email still goes out so no lead is lost.
* **Invoice endpoint:** requires a Supabase access token (`Authorization: Bearer`) that is verified with Supabase Auth and an `admin_users` entry. Same origin only. Rate limited per user and IP, and fails closed if the limiter is down. The body is capped at 5.5 MB, the PDF must decode and start with `%PDF-` (4 MB max), all email HTML is escaped, the filename is sanitized, and every send is logged to `invoice_sends`.
* **Admin pages:** a proxy redirects signed out visitors. Every page and server action also checks the session and the allowlist on the server.
* **Headers:** HSTS, nosniff, frame DENY, referrer policy and a permissions policy. Admin and API routes are `noindex`.

## Environment

See `.env.example`. Preview and production both need the Supabase and Resend variables. `RESEND_API_KEY` is currently set for production only, so add it to Preview to test email on preview deployments.

## Supabase setup (one time)

1. Apply `supabase/migrations/*.sql`.
2. In Auth settings, **turn off public sign ups**. Admin accounts are invited by email.
3. Create each admin user (Auth > Users > Invite), then add them to the allowlist:
   `insert into public.admin_users (user_id, display_name) values ('<auth user id>', 'Name');`

## Domain

Everything that needs the site's address reads `SITE_URL`. When the domain is renewed:

1. Add the domain to the Vercel project and point DNS at Vercel.
2. Set `SITE_URL=https://marysautomotive.com` for Production and redeploy.
3. In Vercel Domains, set `marys-automotive.vercel.app` to redirect (308) to the custom domain.

Previews are always `noindex`. Production indexes only on Vercel's production environment.

## Content that needs owner confirmation

Unverified claims live in `src/content/business.ts` (`verified: false`). On previews they show a yellow "Pending confirmation" marker. In production, unverified sections such as reviews are hidden and markers do not render. Stock photos are always labeled "Stock photo". Replace them in `src/content/photos.ts`.

## Scripts

```
npm run dev        # local dev
npm run build      # production build
npm run typecheck
```
