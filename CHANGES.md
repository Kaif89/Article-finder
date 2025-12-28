Changelog — Improvements applied (by assistant)

Date: 2025-12-28

## Summary

This change set focuses on theming (matt-black dark theme), performance, accessibility, and UX polish.

Files changed (high level)

- `src/index.css` — dark theme variables (matt-black/grey), restored light palette, added focus styles, skip link, and a hero-specific outline button class to avoid white-on-white icons.
- `src/main.tsx` — early theme initializer so the stored/OS theme is applied before React mounts.
- `src/components/Header.tsx` — theme toggle (persists to localStorage), link prefetch on hover.
- `src/components/ArticleCard.tsx` — optimized images: `picture` element with WebP fallback attempt, `loading="lazy"`, `decoding="async"`, `fetchPriority="low"`, width/height and `sizes`. Memoized the component with `React.memo`.
- `src/components/MarkdownRenderer.tsx` — lazy-loaded `react-markdown` via `React.lazy` + `Suspense`; dynamic import of `rehype-sanitize` (optional) to sanitize content.
- `src/App.tsx` — route-level code splitting with `React.lazy` + `Suspense`, skip-to-content link, and prefetch of articles on app mount to populate cache.
- `src/hooks/use-articles.ts` — query options changed: `staleTime` increased, `refetchOnMount: "always"`, `refetchOnWindowFocus: true`; `useEnhanceArticle` now has a typed optimistic update.
- `package.json` — `rehype-sanitize` added (optional plugin for sanitizing Markdown if you want to install it).
- `src/types/rehype-sanitize.d.ts` — module declaration to appease TypeScript when dynamically importing.

## Why these changes

- The dark theme uses neutral matt-black/grey variables to match your requested aesthetic while keeping the original light design intact.
- Lazy-loading and code-splitting reduce initial bundle size and improve Time-to-Interactive.
- Prefetching articles and optimistic UI for enhancements improve perceived speed and responsiveness.
- Accessibility: skip-to-content, visible focus outlines, ARIA-friendly toggles, and safer Markdown rendering (rehype-sanitize optional).
- Images: lazy loading, WebP fallback attempt, and reserved intrinsic size to avoid layout shift and speed up load.

## How to test locally

1. Install optional dependency (rehype-sanitize) and ensure node modules are present:

```powershell
npm install
```

2. Start the dev server:

```powershell
npm run dev
```

Open the app at `http://localhost:8082/` (Vite chooses the next free port if default ports are busy).

## Validation checklist

- [ ] Toggle theme in the header: Dark should be matt-black/grey; Light should match the original warm editorial palette.
- [ ] On page load / app open: articles should be refetched every mount and look fresh (network call to the backend expected).
- [ ] Refresh button (hero) should be readable in light mode and remain suitable in dark mode.
- [ ] Article images should lazy-load and reserve space (no CLS) and prefer WebP when available.
- [ ] Markdown content loads; HTML is sanitized if `rehype-sanitize` is installed.

## Next recommended tasks (priority)

1. Bundle analysis (quick) — find large dependencies and remove/replace heavy libs. Use `vite build` with an analyzer plugin or `rollup-plugin-visualizer`.
2. Virtualize long lists with `react-window` or `@tanstack/react-virtual` for very large article sets.
3. Add image processing (build-time) to generate WebP/AVIF and proper `srcset`/`sizes` for multiple breakpoints.
4. Add unit tests (Vitest + React Testing Library) for `ArticleCard` and `Header` and a small integration test for list rendering.
5. CI & pre-commit hooks: add ESLint, TypeScript checks, and Husky + lint-staged for consistent commits.
6. Readability/Reader mode: implement a focused reading view for the article detail (adjustable font-size, progress bar).
7. Progressive rendering for article grids — implemented: ArticleGrid now renders an initial chunk and lazily loads additional items as the user scrolls to improve perceived load speed without adding deps.

## Notes & caveats

- I added `rehype-sanitize` to `package.json`. It is optional; if you don't want to install it, the app will still work; the MarkdownRenderer will fall back to rendering without sanitize.
- The editor's CSS linter may flag `@apply` and Tailwind-specific rules if Tailwind PostCSS isn't running in the editor environment — that is normal. Vite/Tailwind will process them at build time.

If you'd like, I can now:

- Run a bundle analysis and report the top 10 largest modules.
- Implement virtualized `ArticleGrid` for large lists.
- Add tests for components.
- Further tweak colors and spacing to taste.

Pick one and I’ll implement it next.
