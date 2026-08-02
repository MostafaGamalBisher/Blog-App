# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack) at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (flat config, eslint.config.mjs)
npm run format   # Prettier --write . (uses prettier-plugin-tailwindcss for class sorting)
```

There is no test runner configured in this repo yet.

### Environment

Copy `.env.example` to `.env.local` and fill in values. `SITE_URL` (e.g. `http://localhost:3000`) is required — server components build absolute fetch URLs from it when calling the internal API routes (Next.js server-side `fetch` needs a full URL, relative paths don't work).

## Architecture

This is a Next.js 16 App Router blog app. The defining pattern is that pages **do not read data directly** — they call the app's own internal API routes over HTTP, even though everything runs in the same Next.js server.

```
src/app/api/blogs/blogs.ts        in-memory data store (Record<string, Blog>), plus Blog/RawData types
src/app/api/blogs/route.ts        GET /api/blogs        -> all blogs
src/app/api/blogs/[slug]/route.ts GET /api/blogs/:slug   -> one blog, 404 JSON if missing

src/app/blog/fetchData.ts         fetchData<T>(url) wrapper -> Result<T> = {ok:true,data} | {ok:false,error}
src/app/blog/page.tsx             list page: fetches /api/blogs, filters by ?category=, renders category nav
src/app/blog/[slug]/page.tsx      detail page: fetches /api/blogs/:slug, calls notFound() on failure
src/app/blog/[slug]/not-found.tsx custom 404 UI for the [slug] segment
src/app/blog/loading.tsx          route-level loading UI (App Router loading.tsx convention)
src/app/blog/error.tsx            route-level error boundary ('use client', reset() to retry)
src/app/blog/_components/         BlogCard, BlogsList — presentational, take typed Blog props
```

Two type shapes exist for a blog and the boundary between them matters:

- `RawData` — `date` is a `string` (what the API returns as JSON).
- `Blog` — `date` is a `Date`.

Pages fetch `RawData`, then map `date: new Date(blog.date)` before handing data to components, which are typed against `Blog`. When adding new blog fields or new fetch call sites, preserve this raw-JSON-in / typed-Date-out conversion.

`blogs.ts` is a hardcoded in-memory object, not a database — there is no persistence layer yet. Route handlers key directly into it by slug.

`fetchData` never throws on a bad HTTP response; it returns `{ok: false, error}`. Callers are responsible for turning that into either `throw new Error(...)` (list page, caught by `error.tsx`) or `notFound()` (detail page, caught by `not-found.tsx`). Keep following whichever convention matches the page you're editing.

## Conventions

- Path alias `@/*` -> `./src/*` (tsconfig).
- Styling is Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`); Prettier auto-sorts classes via `prettier-plugin-tailwindcss`.
- Prettier: single quotes, semicolons, 2-space tabs, 80-char print width.
- ESLint extends `eslint-config-next` (core-web-vitals + typescript) with project overrides in `eslint.config.mjs`: `no-console`, `no-use-before-define`, and `no-shadow` are warnings/errors on top of the Next defaults — don't reintroduce them when editing.
- Route segments follow App Router file conventions (`page.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`); private component folders are prefixed with `_` (e.g. `_components/`) so Next.js doesn't treat them as routes.

## Working Mode — Read This First

This project is part of an active learning process. The user is transitioning
from accounting into software engineering and is intentionally writing all code
himself to build capability, not delegating it.

Rules:

1. Do NOT write, generate, or edit code — including "small fixes," boilerplate,
   or config file changes — unless explicitly told "write this for me" in that
   specific request.
2. Default mode is review and explanation. When asked to look at code:
   - Identify the issue.
   - Explain _why_ it's an issue (not just what to change).
   - Do not supply the corrected code unless explicitly asked.
3. If asked a conceptual question, explain the concept and reasoning —
   don't jump straight to a code snippet as the answer.
4. If unsure whether a request is "explain this" vs "fix this," ask before acting.
