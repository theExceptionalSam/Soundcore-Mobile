# Soundcore Admin — Content Management Console

Web-based admin for the Soundcore Studio marketing site. Allows the site owner
(non-technical) to update rates, services, work portfolio, testimonials, FAQs,
about page, and global site settings — without touching code or asking a
developer.

## How it works

```
┌────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Owner logs in │ ──▶ │  Admin SPA edits │ ──▶ │  GitHub API writes │
│  with password │     │  /data/*.json    │     │  to main repo      │
└────────────────┘     └──────────────────┘     └─────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌────────────────────┐
                                              │  Vercel auto-deploy│
                                              │  soundcorestudio.ng │
                                              └─────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌────────────────────┐
                                              │  Static site fetches│
                                              │  /data/*.json live  │
                                              └────────────────────┘
```

1. Owner signs in at the admin URL with a password.
2. Edits content in a friendly form UI (rates, services, etc.).
3. Clicks Save → admin calls GitHub API to commit the JSON to `/data/*.json`
   in the main repo.
4. Vercel detects the commit and redeploys `soundcorestudio.ng` (~30s).
5. The live site fetches the new JSON on the next page load.

No database, no backend service to maintain. Git is the source of truth.

## What's editable

| Section | What it controls |
|---|---|
| **Rate Card** | 5 categories × 3 tiers each. Prices, features, notes, ordering. |
| **Services** | The 6 service cards on the Services page. |
| **Work Portfolio** | YouTube video portfolio. Paste video ID, set title/category/description. |
| **Testimonials** | Client reviews shown in the carousel. Add/edit/remove/reorder. |
| **FAQs** | Frequently asked questions on the FAQ page. |
| **About Page** | Mission, vision, brand tags, description paragraphs. |
| **Site Settings** | Brand name, tagline, contact info, social links, RC number, Formspree endpoint. |
| **Diagnostics** | Live checks that env vars are set up correctly. |

## First-time deployment

### 1. Create a GitHub PAT

The admin needs permission to read and write the `Soundcore-Mobile` repo.

1. Go to <https://github.com/settings/personal-access-tokens/new>
2. Create a **fine-grained** token:
   - **Resource owner**: `theExceptionalSam`
   - **Repository access**: Only select repositories → `Soundcore-Mobile`
   - **Permissions**:
     - Repository permissions → **Contents: Read and write**
     - Repository permissions → **Metadata: Read** (auto-required)
   - **Expiration**: 1 year (renew before it expires)
3. Copy the token (`github_pat_...`) — you'll need it in step 3.

### 2. Deploy the admin to Vercel

1. Push this project to a new GitHub repo (e.g., `Soundcore-Admin`).
2. Go to <https://vercel.com/new> and import the repo.
3. Framework: **Next.js**. No build customisation needed.

### 3. Set environment variables

In the Vercel project settings → Environment Variables, add:

| Name | Value | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | (any strong password you'll remember) | What you type to log in |
| `ADMIN_JWT_SECRET` | (any random string, ~32+ chars) | Signs the session cookie. Use `openssl rand -hex 32` to generate. |
| `GITHUB_TOKEN` | `github_pat_...` (from step 1) | Used to read/write the main repo |
| `GITHUB_OWNER` | `theExceptionalSam` | GitHub username or org |
| `GITHUB_REPO` | `Soundcore-Mobile` | Repo name |

**Important:** Set all five for Production, Preview, and Development environments.

### 4. Redeploy + verify

1. Trigger a redeploy in Vercel (Push a no-op commit, or click Redeploy).
2. Visit the admin URL.
3. Sign in with the `ADMIN_PASSWORD` you set.
4. Go to **Diagnostics** — all four checks should be green.

If any are red, the Diagnostics page tells you what's missing.

## Local development

```bash
# 1. Create a .env file with the five variables above
cp .env.example .env
# (edit .env to fill in your real values)

# 2. Install deps
bun install

# 3. Start dev server
bun run dev
```

Open <http://localhost:3000>.

## Security model

- **Single-user auth.** Anyone with the `ADMIN_PASSWORD` can edit. Don't share it.
- **httpOnly cookie.** Session JWT is stored in an httpOnly, SameSite=lax cookie — JavaScript on the page can't read it.
- **No CORS, no CSRF token.** Same-origin only. The admin and its API routes are on the same domain.
- **GitHub PAT stays server-side.** The browser never sees the token; all GitHub API calls happen in Next.js API routes.
- **All API routes require authentication.** Unauthenticated requests get 401.

The admin is intentionally simple — single user, single repo, no OAuth, no
email service. If you ever need multiple editors or finer permissions, that's
a future migration to NextAuth + a database.

## When things go wrong

**"Failed to load rates" / other sections.** Most likely cause: the GitHub
PAT expired, or the env vars aren't set in the current Vercel environment.
Check the Diagnostics page.

**"Save failed: 409 Conflict".** Someone else (or you, in another tab) saved
the same content while you were editing. Reload the page, re-apply your
changes, and save again.

**Edits don't appear on the live site.** Check that Vercel auto-deploy is on
for the `Soundcore-Mobile` repo. The deploy hook fires on every commit to
`main`. If the deploy is stuck, manually trigger one in the Vercel dashboard.

**Forgot the admin password.** Change `ADMIN_PASSWORD` in Vercel env vars
and redeploy. There's no recovery flow — the password is the password.

## Architecture

| Path | Purpose |
|---|---|
| `src/app/page.tsx` | Main admin SPA (auth gate + sidebar + view switcher) |
| `src/app/layout.tsx` | Root layout with dark theme + Toaster |
| `src/app/api/auth/{login,logout,status}/route.ts` | Auth endpoints |
| `src/app/api/content/[type]/route.ts` | Read/write content JSON via GitHub |
| `src/app/api/upload/route.ts` | Image upload (commit to /img/ via GitHub API) |
| `src/app/api/diagnostics/route.ts` | Environment health check |
| `src/lib/auth.ts` | Password auth + JWT session helpers |
| `src/lib/github.ts` | GitHub REST API wrapper |
| `src/components/admin/*` | Per-section editors (rates, services, work, etc.) |
| `src/components/admin/use-content.ts` | Shared hook for loading/saving content |
| `src/components/admin/use-auth.ts` | Auth status hook |

## License

MIT.
