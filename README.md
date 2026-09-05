# Soundcore Studio — Marketing Site + Admin

This repo holds **two projects**:

| Folder | What it is | Deploys to |
|---|---|---|
| `/` (root) | Static marketing website (vanilla HTML/CSS/JS) | `soundcorestudio.ng` |
| `/admin` | Next.js admin SPA (content management console) | `admin.soundcorestudio.ng` (or similar) |

The static site reads its content from `/data/*.json`. The admin writes those
JSON files via the GitHub API. Each save in the admin = one commit to this
repo = one Vercel auto-deploy of the static site.

Live at **<https://soundcorestudio.ng/>**.

---

## Static site (root)

### Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step, no runtime dependencies.
- **Vercel** for hosting (config in `vercel.json`).
- **Formspree** for the contact form on `contact.html` (no backend code of our own).
- **Google Fonts** (Anton, Rethink Sans, Space Mono) — loaded with a `media="print"`
  swap trick so they never block first paint.

The whole site is **9 HTML pages + 1 CSS file + 2 JS files + content.js + /data/*.json + images**.

## File layout

```
index.html         Home page
about.html         About / mission / vision
services.html      Six service disciplines
rates.html         Tiered pricing across five session types
work.html          Portfolio (YouTube embeds, lite-loaded)
testimonials.html  Client reviews carousel
faq.html           Booking / payment / revisions Q&A
contact.html       Booking form (Formspree endpoint)
privacy.html       NDPR privacy policy
404.html           Not-found page
style.css          All styles (~700 lines, single file)
script.js          All page-specific JS (theme toggle, mobile menu, carousel, FAQ, form)
theme-init.js      Inline-blocking theme bootstrap in <head> (CSP-safe)
vercel.json        Security headers + per-asset Cache-Control
robots.txt         Crawler directives
sitemap.xml        SEO sitemap
img/               All image assets (logos, hero, favicon, etc.)
data/              Content JSON files (single source of truth — edited via /admin)
admin/             The Next.js admin SPA (separate project — see admin/README.md)
```

## Local development

No build step. Just serve the directory:

```bash
# Python 3
python3 -m http.server 8000

# Or with Node
npx serve .

# Or with Vercel CLI (matches production)
npx vercel dev
```

Then open <http://localhost:8000>.

> ⚠️ The contact form posts to a live Formspree endpoint. Test submissions
> will land in the studio's inbox. Don't submit the form from localhost
> unless you mean it.

## Deployment

Push to `main` → Vercel auto-deploys to production. No preview environment
configured. No CI gate.

To set up a fresh clone for deploy access:

```bash
gh auth login   # preferred — keeps tokens off your filesystem
git push origin main
```

## Security posture

- Strict CSP: `default-src 'none'`, `script-src 'self'` (no `'unsafe-inline'`),
  `frame-ancestors 'none'`, plus HSTS, COOP, CORP, Permissions-Policy.
- Theme bootstrap is in an external `theme-init.js` file (not inline) precisely
  so the CSP can stay strict — don't inline it.
- Honeypot field on the contact form (`#f-website`, hidden, must stay empty).
- YouTube embeds use `youtube-nocookie.com` and lazy-load the iframe on click.

## Editing content

Most content edits touch a single HTML file. The phone number
`+234 701 084 1565` and email `bookings@soundcorestudio.ng` are duplicated
across every page — search-and-replace carefully if they ever change.

The studio's RC number, social links, and Formspree form ID are also scattered
across files. A future refactor (Astro / Eleventy) should centralise these
into a single config file.

## Image pipeline

There is no build-step image pipeline — images are hand-optimised:

- `hero-studio.jpg` (98 KB) is the original. Responsive WebP variants
  (`hero-studio-768.webp`, `hero-studio-1280.webp`, `hero-studio-1600.webp`)
  are served via CSS `image-set()` on the `#hero` background.
- `favicon.webp` (20 KB) is the primary favicon. `favicon.ico` (1 KB) is
  the legacy fallback.
- `apple-touch-icon.png` (29 KB, 180×180) is for iOS home-screen bookmarks.

To regenerate favicons or hero variants from source, run:

```bash
python3 ../scripts/prep_images.py    # adjust path to wherever you keep it
```

Requires Pillow (`pip install pillow`).

## License

MIT — see [LICENSE](LICENSE).
