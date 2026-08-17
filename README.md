# Blog App

A blog platform built with the Next.js App Router, focused on server-side data handling, typed API contracts, and client-side caching.

**Live:** https://blog-app-mostafagamalbisher.vercel.app

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Data fetching | TanStack Query |
| Theming | next-themes |
| Icons | lucide-react |
| Deployment | Vercel |

---

## Features

- **Server-side pagination** — offset-based, with `total` and `hasNextPage` metadata driving navigation controls
- **Category filtering** — applied server-side before pagination, so page counts reflect the filtered result set
- **Full-text search** — matches titles or content, case-insensitive and trimmed, debounced client-side
- **Composable filters** — search, category, and page coexist in the URL; changing a filter resets pagination, changing pagination preserves filters
- **Shareable state** — every view is fully described by its URL and survives refresh, bookmarking, and direct entry
- **Dark mode** — CSS custom property tokens with class-based switching, no flash on load
- **Responsive layout** — mobile-first, with constraint-based card sizing rather than fixed heights

---

## Architecture

### Data flow

```
blogs.ts  →  Route Handler  →  fetchData  →  adapter fn  →  useQuery  →  component
(source)     (filter, slice,   (HTTP +      (Result<T> →   (cache)      (render)
              derive fields)    Result<T>)   throw/return)
```

### Type boundaries

Three types describe the same data at different points in its lifecycle:

- `StoredBlog` — source data, before derived fields are added (`Omit<Blog, 'image'>`)
- `Blog` — in-memory shape with real `Date` objects
- `RawData` — wire shape after JSON serialization, where dates are strings

The distinction matters because `JSON.stringify` converts `Date` to string automatically. Typing the API response as `Blog[]` on the server and `RawData[]` on the client keeps both honest about what actually exists at that point.

### Filter-then-paginate

Filtering runs before slicing, so `total` and `hasNextPage` describe the filtered population rather than the full dataset. The reverse order — paginating first, then filtering the current page — produces incorrect pagination and categories that appear or disappear depending on which page is loaded.

### Server and client boundaries

Pages are Server Components by default. Client Components are introduced only where interactivity requires them:

- `CategoriesList` — dropdown with programmatic navigation
- `PaginatedBlogsList` — TanStack Query cache
- `SearchBar` — debounced input with local state
- `ThemeToggle` — theme switching

The blog detail page remains a Server Component deliberately: article content benefits from server rendering, and its single-fetch pattern doesn't justify a client-side cache.

### Cache keys

Query keys encode every value that makes a request distinct:

```ts
queryKey: ['blogs', { page, category, search }]
```

Omitting any of these would cause different requests to share a cache entry and return stale results.

### Environment-aware base URLs

Server-side `fetch` requires absolute URLs; browser-side `fetch` resolves relative paths against the current origin. `getBaseUrl()` handles all three cases:

- Browser — returns `''`, letting the browser resolve the origin
- Vercel — `VERCEL_PROJECT_PRODUCTION_URL` with `https://` prepended
- Local — `SITE_URL` from `.env.local`, throwing if absent

`VERCEL_URL` is deliberately not used: it points to a deployment-specific address that carries authentication protection, which returns an HTML challenge page rather than JSON.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── blogs/
│   │   │   ├── [slug]/route.ts    # single blog
│   │   │   ├── blogs.ts           # data source + types
│   │   │   └── route.ts           # list: filter, search, paginate
│   │   └── categories/route.ts    # unpaginated category list
│   ├── blog/
│   │   ├── _components/           # route-specific components
│   │   ├── [slug]/                # detail page + not-found
│   │   ├── utils/                 # fetchData, query adapters
│   │   ├── layout.tsx             # QueryClientProvider
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── page.tsx
│   ├── globals.css                # theme tokens
│   ├── layout.tsx                 # root: fonts, ThemeProvider
│   └── theme-provider.tsx
├── components/                    # app-wide components
│   └── ui/                        # shadcn primitives
└── lib/
    └── useDebounce.ts
```

---

## Running locally

```bash
npm install
```

Create `.env.local`:

```
SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Production build:

```bash
npm run build && npm start
```

---

## API

### `GET /api/blogs`

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `1` | Items per page |
| `category` | — | Exact category match |
| `search` | — | Substring match on title or content |

```json
{
  "data": [ /* Blog[] */ ],
  "meta": { "total": 14, "page": 1, "limit": 10, "hasNextPage": true }
}
```

### `GET /api/blogs/[slug]`

Returns a single blog, or `404` with `{ "error": "Blog not found" }`.

### `GET /api/categories`

Returns the deduplicated category list across the full dataset:

```json
{ "data": ["typescript", "nextjs", "css", "javascript"] }
```

This exists as a separate endpoint because deriving categories from a paginated response would only surface categories present on the current page.

---

## Notes

Blog data is currently an in-memory object rather than a database. Placeholder images are generated from each blog's slug via `placehold.co`. Both are intentional for this stage — the API contract is shaped so that swapping in a real data layer requires no changes to the frontend.
