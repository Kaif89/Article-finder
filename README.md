# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

# Content Companion

A lightweight, privacy-first article aggregator and enhancer built with React, TypeScript and Tailwind CSS. This project scrapes, stores and surfaces articles (from configured sources) and can optionally enhance content using AI workflows. It also includes an optional Supabase Edge Function image-proxy for faster image delivery at the edge.

Short description (for GitHub):

> Fast, dark-themed article aggregator with opt-in AI enhancement and an edge image proxy for faster image delivery.

## Why this project exists

Content Companion helps you collect, preview and enhance articles from external sites. It focuses on:

- Speed: progressive rendering, lazy-loaded markdown and optional image proxying.
- Safety: server-side endpoints and a conservative allowlist for proxied images.
- UX: a matte black / grey dark theme and fast perceived load for lists and images.

## Features

- Article scraping and storage (Supabase back-end).
- Article enhancement pipeline (AI-powered; optional and configurable).
- Dark (matte black / grey) theme and responsive UI built with Tailwind CSS.
- Progressive list rendering and optimized image component with WebP hints.
- Supabase Edge Function `image-proxy` to centralize image delivery and enable caching at the edge.

## Quick start (local development)

Install dependencies and run locally:

```powershell
# Clone
git clone <YOUR_REPO_URL>
cd <YOUR_REPO_DIR>

# Install
npm install

# Start dev server
npm run dev
```

## Environment variables

Create a `.env` file (or set env vars in your host) and include at least the following for local dev when using Supabase features:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Optional (edge function / image proxy):

- `VITE_IMAGE_PROXY_URL` — URL of the deployed image-proxy function (e.g. `https://<proj>.functions.supabase.co/image-proxy`). When set, the front-end will route images through the proxy for caching and format hints.

### Supabase Edge Function config (image-proxy)

The repository includes a minimal image proxy at `supabase/functions/image-proxy/index.ts`. It provides a safe, cached proxy for images and is intended as a fast way to improve image delivery without introducing an external paid CDN.

#### How to use the proxy

1. Deploy the function to your Supabase project (via the Supabase CLI or dashboard).
2. Set `VITE_IMAGE_PROXY_URL` to the function URL in your front-end environment and restart the dev server.
3. Optionally set the `ALLOWED_HOSTS` environment variable on the function (comma-separated hostnames) to extend the default allowlist.

Notes:

- The current proxy implementation streams images and sets strong Cache-Control headers. It intentionally does not perform resizing/encoding (no Sharp). For bandwidth and performance improvements, consider having the proxy perform resizing/format conversion (AVIF/WebP) in a runtime that supports native image libraries (Node + sharp or a managed image CDN).

## Development notes & useful commands

- Start dev server: `npm run dev`
- Build: `npm run build`
- Preview production build: `npm run preview`
- Lint / typecheck: follow project's existing scripts (if any)

## Troubleshooting

- If images are not using the proxy, ensure `VITE_IMAGE_PROXY_URL` is set and the app was rebuilt.
- If the Supabase functions folder shows TypeScript errors in your editor, treat it as Deno/Edge code — those files run in the Supabase Functions environment and may need Deno types configured locally.

## Contributing

Contributions are welcome! A few suggestions:

- Open an issue first if you plan large changes.
- Keep PRs focused and include a short description of the change and why.
- Add or update tests when adding new behavior.

## License

This project does not include a LICENSE file by default. Add an open source license (MIT, Apache-2.0, etc.) if you plan to share the project publicly.

## Contact / links

- Project: Content Companion
- Repo: add your GitHub repo URL here
