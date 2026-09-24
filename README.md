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

- **Server-side pagination** — offset-based, with `total` and `hasNextPage` metadata driving navigation controls; `page` and `limit` are validated
- **Newest first** — blogs are sorted by date (ties broken by slug) before pagination
- **Category filtering** — applied server-side before pagination, so page counts reflect the filtered result set
- **Full-text search** — matches titles or content, case-insensitive and trimmed, debounced client-side
- **Composable filters** — search, category, and page coexist in the URL; changing a filter resets pagination and keeps the other filter, changing pagination preserves filters
- **Shareable state** — every view is fully described by its URL and survives refresh, bookmarking, direct entry, and Back/Forward
- **Literal search text** — all URLs are built with `URLSearchParams`, so input such as `C++`, `a&b` or `#` stays literal
- **Dark mode** — CSS custom property tokens with class-based switching, no flash on load
- **Responsive layout** — mobile-first, with constraint-based card sizing rather than fixed heights

---

## Architecture

### Data flow

```
                                  ┌→ Route Handler → fetchData → adapter fn → useQuery → component
store.ts  →  data.ts (server-only)│   (validate,     (HTTP +     (check shape,  (cache)    (render)
(source)     (filter, sort,       │    JSON)          Result)     throw)
              paginate, derive)   └→ Server Component (detail page reads it directly)
```

The list page runs in the browser through TanStack Query, so it calls the API over HTTP. The detail page is a Server Component, so it calls the same data-access functions (`src/server/blogs/data.ts`) directly instead of fetching its own API. Both therefore read the same deployment's data, and no base URL or environment variable is needed.

### Type boundaries

Three types describe the same data at different points in its lifecycle:

- `StoredBlog` — source data, before derived fields are added (`Omit<Blog, 'image'>`)
- `Blog` — in-memory shape with real `Date` objects
- `RawData` — wire shape after JSON serialization, where dates are strings (derived from `Blog`)

The distinction matters because `JSON.stringify` converts `Date` to string automatically. Typing the API response as `Blog[]` on the server and `RawData[]` on the client keeps both honest about what actually exists at that point.

Response contracts are separate types: `PaginatedResponse<T>` (`/api/blogs`, always has `meta`), `ListResponse<T>` (`/api/categories`) and `ApiErrorResponse` (`{ error }`). Types live in `src/lib/blogs/types.ts` so both server and client code can import them. Because a TypeScript type does not check JSON at runtime, the client adapters validate each response with the guards in `src/lib/blogs/guards.ts` before using it.

### Filter-then-paginate

Filtering and sorting run before slicing, so `total`, `hasNextPage` and page contents describe the filtered, ordered population rather than the full dataset. The reverse order — paginating first, then filtering the current page — produces incorrect pagination and categories that appear or disappear depending on which page is loaded.

### Server and client boundaries

Pages are Server Components by default. Client Components are introduced only where interactivity requires them:

- `CategoriesList` — dropdown with programmatic navigation
- `PaginatedBlogsList` — TanStack Query cache
- `SearchBar` — debounced input with local state
- `ThemeToggle` — theme switching

The blog detail page remains a Server Component deliberately: article content benefits from server rendering, and its single-fetch pattern doesn't justify a client-side cache. `src/server/blogs/store.ts` and `data.ts` import `server-only`, so importing them into a Client Component fails the build instead of shipping data-store code to the browser.

### URL state and search

The URL is the source of truth for the committed search, category and page. `SearchBar` keeps a local draft of what is being typed and commits it to the URL 300 ms after typing stops.

Navigation policy (rules in `src/lib/blogs/searchSync.ts`):

- URL changes are recognised by the **whole query string**, not only the search text. Going Back from `?search=e&page=2` to `?search=e` is still a navigation even though the search is unchanged.
- When the URL changes because of `SearchBar`'s own commit, the draft is kept, so letters typed while that navigation is in flight are not lost.
- Any other URL change (Back/Forward, the "All Blogs" reset, pagination, a link) replaces the draft with the URL value, so text that was still waiting for the debounce is discarded, never committed later.
- Clicking a link cancels a pending commit immediately, so on a slow network the debounce cannot fire while the link's navigation is still loading and override it.
- Choosing a category applies the text currently in the search box (committed or not) together with the category, and returns to page 1. "all categories" removes only the category. The category menu reads the draft through `SearchDraftContext`.
- The empty-results "All Blogs" link resets everything (search, category, page).
- History: starting or clearing a search adds a history entry; refining an existing search replaces the current entry, so Back does not step through every partly typed word.

### `/blog` URL validation

`src/app/blog/page.tsx` validates its URL (`src/lib/blogs/pageParams.ts`) before anything reaches components, query keys or URL builders, using the same per-parameter rules as the API (`src/lib/blogs/queryParams.ts`):

- A repeated `search`, `category` or `page` (even with identical values, e.g. `?search=a&search=a`) is invalid.
- `page` must be a plain positive integer (`?page=abc`, `?page=0` and `?page=` are invalid).
- Absent or empty `search`/`category` means no filter. Single values are kept literally: `?search=a%2Cb` searches for `a,b`, and `+`, `&`, `#` and non-Latin text stay as typed.

An invalid URL shows "This link has invalid filters" with the reason and a **Show all blogs** link to `/blog`; no data request is made.

### Error handling

Each failure is shown at the scope it affects:

| Failure | Result |
|---|---|
| Blog slug does not exist (`/blog/x`) | `notFound()` → `not-found.tsx` |
| Server error while rendering a page | `error.tsx` (message hidden in production) |
| Blog list request fails | Inline message with **Try again** and **Show all blogs** |
| Category list request fails | Retry item inside the category menu; the rest of the page keeps working |
| Invalid `/blog` URL (repeated or malformed parameter) | "This link has invalid filters" with **Show all blogs** |

Retries: TanStack Query retries a failed request up to 3 times, except an HTTP `400`. A 400 means validation rejected the request, so the error is shown at once instead of after about 7 seconds of identical doomed requests. Other statuses, including `408` and `429`, and network errors keep the retries (`shouldRetryQuery` in `fetchData.ts`, which reads the structured error `cause`, not the message).

`fetchData` (browser only) returns every expected failure as a `Result` instead of throwing, labelled `network`, `http` (with status and the API's error message) or `parse`. The query adapters (`getBlogsFn`, `getCategoriesFn`) turn a failure into a thrown `Error` for TanStack Query and keep the original failure as the error's `cause`.

Because `src/app/blog/loading.tsx` makes the detail page stream, a missing blog is rendered with HTTP status `200` plus `<meta name="robots" content="noindex">` (documented Next.js behaviour for streamed responses). The API route `/api/blogs/[slug]` returns a real `404`.

### Cache keys

Query keys encode every value that makes a request distinct:

```ts
queryKey: ['blogs', { page, category, search }]
```

Omitting any of these would cause different requests to share a cache entry and return stale results.

### No base URL

Earlier versions fetched the app's own API from Server Components, which needed an absolute URL (`SITE_URL` locally, `VERCEL_PROJECT_PRODUCTION_URL` on Vercel). On preview deployments that made the detail page read *production* data while the list read the preview's own data. Server Components now read data directly, and browser requests use relative paths, so no base URL is needed anywhere.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── blogs/
│   │   │   ├── [slug]/route.ts    # single blog
│   │   │   ├── listQuery.ts       # validation of page/limit/category/search
│   │   │   └── route.ts           # list: validate, then call the data layer
│   │   └── categories/route.ts    # unpaginated category list
│   ├── blog/
│   │   ├── _components/           # route-specific components
│   │   ├── [slug]/                # detail page + not-found
│   │   ├── utils/                 # fetchData, query adapters (browser)
│   │   ├── layout.tsx             # QueryClientProvider
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── page.tsx
│   ├── globals.css                # theme tokens
│   ├── layout.tsx                 # root: fonts, ThemeProvider
│   └── theme-provider.tsx
├── components/                    # app-wide components
│   └── ui/                        # shadcn primitives
├── lib/
│   └── blogs/                     # shared (server + client)
│       ├── types.ts               # Blog, RawData, response contracts
│       ├── guards.ts              # runtime checks for API JSON
│       ├── urls.ts                # URLSearchParams-based URL builders
│       ├── queryParams.ts         # parameter rules shared by API and page
│       ├── pageParams.ts          # /blog URL validation
│       └── searchSync.ts          # SearchBar URL/draft rules
└── server/
    └── blogs/                     # server-only
        ├── store.ts               # in-memory data source
        ├── query.ts               # filter, sort, paginate (pure)
        └── data.ts                # data-access functions
```

Unit tests sit next to the code they cover (`*.test.ts`). Browser tests are in `e2e/` (`playwright.config.ts`).

---

## Running locally

```bash
npm install
npm run dev
```

No environment variables are required.

Production build:

```bash
npm run build && npm start
```

Checks:

```bash
npm run lint
npm test          # Vitest unit and route-handler tests
npm run test:e2e  # Playwright browser tests (e2e/); builds and starts the production app on port 3100
```

Before the first browser-test run on a machine: `npx playwright install chromium`. Set `E2E_PORT` to use another port.

---

## API

### `GET /api/blogs`

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number, a positive integer |
| `limit` | `1` | Items per page, a positive integer, at most `100` |
| `category` | — | Exact category match |
| `search` | — | Substring match on title or content (trimmed) |

Results are sorted newest first.

```json
{
  "data": [ /* Blog[] */ ],
  "meta": { "total": 14, "page": 1, "limit": 10, "hasNextPage": true }
}
```

Validation rules:

- Only an **absent** `page` or `limit` gets the default. A present value must be plain digits for a positive safe integer (`2` is valid; `0`, `-1`, `1.5`, `01`, `abc` and an empty value are not).
- `limit` above `100` is rejected, not reduced.
- Repeating any parameter (`?page=1&page=2`) is rejected.
- An empty `category` or `search` means no filter.
- Invalid input returns `400` with `{ "error": "<reason>" }`.
- A page past the end returns `200` with an empty `data` array and `hasNextPage: false`.

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
