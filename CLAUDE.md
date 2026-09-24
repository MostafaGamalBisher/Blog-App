# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack) at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (flat config, eslint.config.mjs)
npm test         # Vitest (vitest.config.mts): unit + route-handler tests, src/**/*.test.ts
npm run format   # Prettier --write . (uses prettier-plugin-tailwindcss for class sorting)
```

### Environment

No environment variables are required. Server Components read data directly (no HTTP call to the app's own API), and browser requests use relative `/api/...` paths, so there is no base URL to configure.

## Architecture

Next.js 16 App Router blog app. Data lives in an in-memory store behind a small server-only data-access layer. The API route handlers and Server Components both call that layer; Client Components (TanStack Query) call the API over HTTP.

```
src/server/blogs/store.ts          in-memory data store, Record<slug, StoredBlog> (server-only)
src/server/blogs/query.ts          pure filter -> sort newest-first -> paginate (queryBlogs)
src/server/blogs/data.ts           listBlogs / getBlogBySlug / listCategories (server-only)

src/app/api/blogs/listQuery.ts     validates GET /api/blogs query params (400 on invalid)
src/app/api/blogs/route.ts         GET /api/blogs         -> PaginatedResponse<Blog>
src/app/api/blogs/[slug]/route.ts  GET /api/blogs/:slug   -> Blog, or 404 { error }
src/app/api/categories/route.ts    GET /api/categories    -> ListResponse<string>

src/lib/blogs/types.ts             Blog, StoredBlog, RawData, response contracts (shared)
src/lib/blogs/guards.ts            runtime checks for API JSON (shared)
src/lib/blogs/urls.ts              URLSearchParams-based builders for /blog and /api/blogs URLs
src/lib/blogs/searchSync.ts        SearchBar rules: URL vs typed draft, push/replace policy

src/app/blog/utils/fetchData.ts    browser-only fetch -> Result (network | http | parse failures)
src/app/blog/utils/get*Fn.ts       TanStack Query adapters: validate shape, throw Error with cause
src/app/blog/page.tsx              list page: reads searchParams, renders CategoriesList, SearchBar, PaginatedBlogsList
src/app/blog/[slug]/page.tsx       detail page: getBlogBySlug() directly, notFound() when null
src/app/blog/[slug]/not-found.tsx  custom 404 UI for the [slug] segment
src/app/blog/loading.tsx           route-level loading UI (makes /blog/* responses stream)
src/app/blog/error.tsx             route-level error boundary ('use client', reset() to retry)
src/app/blog/_components/          BlogCard, BlogsList (presentational); CategoriesList, SearchBar, PaginatedBlogsList (client)
```

Type shapes for a blog, and the boundary between them:

- `StoredBlog` — store shape, no `image`.
- `Blog` — `date` is a `Date`, `image` derived by the data layer.
- `RawData` — `date` is a `string` (what the API returns as JSON).

Server code works with `Blog`. Client adapters receive `unknown` JSON, check it with the guards, then map `date: new Date(blog.date)` before handing data to components typed against `Blog`. When adding blog fields, update the type, the guard and the store together.

URL rules: build every `/blog` or `/api/blogs` URL with the helpers in `src/lib/blogs/urls.ts` (never string-interpolate query values). The URL is the source of truth for search/category/page; changing a filter keeps the other filter and resets the page.

Error policy: a missing blog -> `notFound()`; thrown server errors -> `error.tsx`; a failed list query -> inline message with retry; a failed category query -> retry item inside the menu. `fetchData` returns failures as values; the adapters throw for TanStack Query and keep the failure as `cause`.

## Conventions

- Path alias `@/*` -> `./src/*` (tsconfig; mirrored in `vitest.config.mts`).
- Modules that import `server-only` (`src/server/**`) must never be imported by Client Components.
- Styling is Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`); Prettier auto-sorts classes via `prettier-plugin-tailwindcss`. `globals.css` imports `shadcn/tailwind.css`, so the `shadcn` package is a real dependency.
- Prettier: single quotes, semicolons, 2-space tabs, 80-char print width.
- ESLint extends `eslint-config-next` (core-web-vitals + typescript) with project overrides in `eslint.config.mjs`: `no-console`, `@typescript-eslint/no-use-before-define`, `@typescript-eslint/no-shadow` and `@typescript-eslint/no-unused-vars` (the TypeScript-aware versions replace the core rules) — don't reintroduce them when editing.
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
