# Blog-App: Implementation Report

Handoff: `BLOG_APP_IMPLEMENTATION_CHECKLIST.md` (2026-09-24)
Review baseline and starting commit: `4c40fe2b0e60978da5be4e58e7a137bd8f4e14ee`
Branch: `claude/repo-code-review-nv48oi`

This report records what was changed, why, and how it was verified. Each item points back to the problem it fixes. The commit that adds this report is named in the chat reply, because a commit cannot contain its own hash.

---

## 1. Summary

**What users see now**

- **Search follows the URL.** "All Blogs" clears the search and it stays cleared. Back and Forward land on the expected search, category and page, and the search box shows the matching text. Before, a stale search was pushed back into the URL, which trapped Back and made "All Blogs" do nothing.
- **Filters combine.** Changing the category keeps the search and goes back to page 1. "all categories" removes only the category, and "All Blogs" resets everything.
- **Search text stays literal.** `C++`, `css&category=nextjs`, `css#layout`, text with spaces, and Arabic reach the API unchanged. Before, `&category=` in a search added a real category filter, and `+` became a space.
- **Newest first.** The list is sorted by date, newest first, to match the "most recent" heading.
- **Invalid API input returns 400.** `page` and `limit` are validated and the maximum `limit` is 100. Before, `page=-1` returned 4 real items and `page=1.5` returned 9.
- **Inherited object keys return 404.** `/api/blogs/toString`, `/constructor` and `/__proto__` now return 404, and `/blog/toString` shows the 404 page. Before, they returned a malformed 200 and the page showed "Invalid Date".
- **The detail page reads its own deployment's data.** It no longer fetches the production site over HTTP, so no environment variables are needed.
- **Errors are shown where they happen.**
  - A missing blog shows the 404 page.
  - A server failure shows the error page, with the internal message hidden in production.
  - A failed list load shows an inline message with **Try again**.
  - A failed category load shows a retry item in the menu and leaves the rest of the page working.
- **"All Blogs" is readable in both themes.** Contrast is 17.9:1 in light and 15.7:1 in dark. Before, it was white text on a white background.

**Development changes**

- **Tests:** Vitest with 105 tests, run with `npm test`.
- **Lint:** the three TypeScript-aware ESLint rules replace the core ones.
- **Docs:** README, `CLAUDE.md` and `.env.example` are updated.

---

## 2. Checklist status

### 0. Working baseline

| Item | Status | Evidence / notes |
|---|---|---|
| Read instructions, scripts, deps, lockfile, README, tests | Done | No existing tests. `CLAUDE.md` working-mode rule overridden by this delegated handoff ("write the code yourself"). |
| Branch, HEAD, remotes, status | Done | HEAD = `4c40fe2` = reviewed baseline = `origin/main`. Remote `origin` = github.com/MostafaGamalBisher/Blog-App. Working tree clean. |
| Preserve unrelated changes | Done | There were none. Temporary worktrees were used only for baseline and per-commit checks, then removed. |
| Dedicated branch | Done, with a departure | Reused the session's task branch `claude/repo-code-review-nv48oi` rather than creating `fix/blog-review-findings` (the checklist allows reusing an appropriate task branch; this environment is restricted to that branch). |
| Repository package manager | Done, with an exception | npm with `package-lock.json`. The installed npm 10.9.7 crashed while adding Vitest (npm bug: `Cannot read properties of null (reading 'edgesOut')`). That single install was run with npm 11, then the new lockfile installed cleanly with npm 10 `npm ci`. |
| Official docs for version-specific behaviour | Done | Used the Next.js 16 docs bundled in `node_modules/next/dist/docs`: `server-only` handling, and not-found status codes during streaming. |
| Baseline checks | Done | `npm run lint` passed, `tsc --noEmit` passed, `npm run build` passed. No pre-existing failures. |
| Confirm each finding still applies | Done | All confirmed on a baseline production server (HTTP) and in Chromium; see §5, "Baseline confirmation". |

### 1. Search, navigation and query encoding

| Item | Status |
|---|---|
| URL is the source of truth; local draft only for debouncing | Done |
| Stale input can't overwrite Back/Forward or cleared filters | Done |
| Pending debounce cancelled when navigation supersedes it | Done |
| Category change keeps search and resets page | Done |
| Reset-all clears search + category; "all categories" keeps search | Done |
| `URLSearchParams` everywhere, no double encoding | Done |
| Keep other parameters; document push/replace; keep 300 ms debounce | Done |
| Acceptance: search → category → paginate → Back/Forward agree | Done (browser) |
| Acceptance: pending debounce, rapid typing, reset | Done (browser) |
| Acceptance: `C++`, `css&category=nextjs`, `css#layout`, spaces, Arabic | Done (browser for input, page URL and API request; unit tests for pagination hrefs) |
| Acceptance: `&category=` in search adds no category parameter | Done (browser and unit tests) |

### 2. API inputs and article lookup

| Item | Status |
|---|---|
| Validate page/limit as positive safe integers | Done |
| Keep default limit `1` | Done (kept) |
| Maximum limit 100, 400 above it | Done |
| Default only absent parameters; empty and repeated handled consistently | Done |
| No unsafe offsets; coherent metadata for large pages | Done |
| Filter before paginate; coherent out-of-range policy | Done (out of range = 200 with empty `data`, `hasNextPage: false`) |
| Own-property slug lookup | Done (`Object.hasOwn`) |
| Acceptance: every listed invalid/edge input, checked over HTTP | Done (real `next start` server, curl) |
| Acceptance: `toString`, `constructor`, `__proto__` → 404 | Done |

### 3. Server data access and error meaning

| Item | Status |
|---|---|
| Shared server-side data-access layer | Done (`src/server/blogs/data.ts`) |
| Detail page reads data directly; API routes kept | Done |
| Server data kept out of client bundles | Done (`server-only`; verified) |
| Cache/revalidation behaviour preserved | Done (same route table: `/blog/[slug]` still rendered on demand) |
| Missing → `notFound()`; operational failure → error UI | Done |
| Fetch helper handles HTTP, network, parse; policy documented | Done |
| No swallowed Next.js control flow; no internal details shown | Done |
| Category error keeps its information | Done |
| Acceptance: list and detail read the same checkout's data | Done (temporary fixture, production build) |
| Acceptance: missing → 404 UI; failure → error UI; query recovers | Done |
| Acceptance: preview deployment check | **Not performed**: no preview deployment was available. Local checks don't prove deployment behaviour. |

### 4. Ordering and visible correctness

| Item | Status |
|---|---|
| Newest first before pagination, deterministic, no mutation | Done |
| Empty-state link readable in both themes | Done |
| Loading, empty, error, success states still render | Done (browser) |
| Ordering checked across two pages | Done (browser: dates strictly non-increasing across pages 1–2; unit test with shuffled dates and a date tie) |
| Empty state in both themes; reset works | Done |

### 5. Types, tooling and documentation

| Item | Status |
|---|---|
| Separate paginated and list response contracts | Done |
| Runtime checks for untrusted JSON (no new validation dependency) | Done (`src/lib/blogs/guards.ts`) |
| TypeScript-aware lint rules | Done (no new warnings in the codebase) |
| README, `CLAUDE.md`, `.env.example` updated | Done |
| `SITE_URL` re-evaluated | Done: no longer needed anywhere, so removed from docs and `.env.example` |
| Keep `shadcn` | Done (untouched) |
| Remove only dead code made obsolete | Done: `getBaseUrl`, `useDebounce`, `SentRawData`, `BlogOmit` |

### 6. Optional work

Evaluated and **deferred** (not implemented):

- Server prefetching/hydration of list content.
- Keeping previous data during uncached page changes.
- Metadata, semantic markup, navigation redesign.
- Brand link `/` → `/blog`.
- Changing the default page size.

### 7. Verification and commits

| Item | Status |
|---|---|
| Regression tests | Done (7 files, 105 tests) |
| Real browser history/debounce checks | Done (Chromium via Playwright, script kept outside the repo) |
| Lint, type check, tests, production build | Done; all pass |
| Final diff inspected | Done: no secrets, debug code, fixtures or build output committed; lockfile changes explained below |
| Coherent commits, only task files | Done |
| This report committed | Done (hash in chat reply) |
| Push task branch | See chat reply for result |
| Final working-tree status | Clean (no pre-existing changes existed) |

---

## 3. Implementation decisions

### Debounce and history policy

The URL holds the committed search, and the input holds a *draft*. The rules are in `src/lib/blogs/searchSync.ts`:

1. **URL changes for any other reason.** This covers Back, Forward, "All Blogs" and links. The draft is replaced by the URL value during render. Because the debounce timer restarts whenever the draft or URL changes, any pending commit is cancelled, and a stale draft can no longer be written back. This was the root cause of the original bug.
2. **The URL changes because of SearchBar's own navigation.** SearchBar remembers the value it navigated to (`pendingSearch`). The draft is kept, so letters typed while the navigation is in flight are not lost.
3. **History:** starting or clearing a search **pushes** a history entry. Refining an existing search (`gen` → `generics`) **replaces** the current entry. So Back returns to the list as it was before the search, and doesn't step through each partly typed word.
4. **Debounce** stays at 300 ms.
5. **Typing, then quickly picking a category:** the typed text is still applied, together with the new category. The input shows that text, so the URL should too.

`useDebounce` was removed. Its delayed value was the source of the stale write: it still held the old search after the URL had already changed.

### Pagination contract (`GET /api/blogs`)

| Input | Result |
|---|---|
| `page` / `limit` absent | Defaults: `page=1`, `limit=1` (documented default kept; the UI sends `limit=10`) |
| Plain positive integer (e.g. `2`) | Accepted if it is a safe integer; `limit` must be ≤ **100** |
| `0`, `-1`, `1.5`, `01`, `1e3`, `abc`, ` 1`, empty value | `400 { "error": "... must be a positive integer" }` |
| Larger than `Number.MAX_SAFE_INTEGER` | `400 { "error": "... is too large" }` |
| `limit` > 100 | `400`, never silently reduced |
| Any of page/limit/category/search repeated | `400 { "error": "... must not be repeated" }` |
| Empty `category` / blank `search` | No filter |
| Page past the end (including `MAX_SAFE_INTEGER`) | `200`, `data: []`, `hasNextPage: false`. The offset is only computed for pages that exist, so no unsafe arithmetic happens. |

### Shared data access

- **`src/server/blogs/store.ts`:** the existing in-memory data, moved from `src/app/api/blogs/blogs.ts`. The data itself is unchanged.
- **`src/server/blogs/query.ts`:** a pure filter → sort → paginate function. It is pure so it can be tested with any data.
- **`src/server/blogs/data.ts`:** `listBlogs`, `getBlogBySlug` and `listCategories`.
  - Both the API routes and the detail page call these.
  - They are `async`, so callers won't change if a database replaces the in-memory object.
  - The placeholder `image` is now added here, so the page and the API get the same field.
- **The `server-only` import** is on the store and the data layer. Next.js handles it itself, so no extra package was installed (per the Next.js 16 docs).
- **`/api/blogs/[slug]` is kept** for browser and API use, even though the app no longer calls it internally.

### Error handling

| Failure | Handling | Why |
|---|---|---|
| Unknown slug | `notFound()` → `not-found.tsx` | The resource really doesn't exist |
| Thrown server error on the detail page | `error.tsx`; in production Next.js replaces the message with a generic one and a digest | Operational failure, not "missing" |
| Blog list query fails | Inline "Couldn't load blogs." + **Try again** + **Show all blogs** | Main content; retry is local |
| Category query fails | "Couldn't load categories. Retry" item inside the menu | Non-essential. Before, it threw an empty `Error` that replaced the whole page. |

Why the category menu doesn't throw to `error.tsx`: TanStack Query keeps a failed query in its error state. Resetting the error boundary re-renders the component, but it would throw again unless a query-reset boundary were added. This is reasoning from how TanStack Query works; it wasn't tested separately.

**`fetchData` (browser only):**

- It returns every expected failure as a value: `network`, `http` (with the status and the API's `{ error }` message), or `parse`.
- Its data is typed `unknown`, and the adapters check the shape with `src/lib/blogs/guards.ts`.
- The adapters throw an `Error` whose `cause` is the original failure. TanStack Query needs a thrown error, and the `cause` keeps the diagnostic details.
- Its `try/catch` blocks wrap only `fetch()` and `response.json()`, so they can't swallow Next.js control-flow errors such as `notFound()`.

### Departures from the checklist

- **Branch:** reused the session task branch (see §2.0).
- **npm 11 for one install:** used because of the npm 10 crash. The result was verified with npm 10 `npm ci`.
- **Commit grouping:** newest-first ordering is in the API/data commit because it lives in the data layer. The empty-state colour is in the navigation commit because it's in the same component. Each commit was checked separately and passes `tsc` and `eslint`.
- **Placeholder image URL:** the slug is now passed through `encodeURIComponent`. Current slugs contain no special characters, so current URLs are unchanged.

---

## 4. Changed files

| Path | Purpose |
|---|---|
| `src/server/blogs/store.ts` (moved from `src/app/api/blogs/blogs.ts`) | In-memory data, now `server-only`; types moved out |
| `src/server/blogs/query.ts` | Pure filter → newest-first sort → paginate; image derivation |
| `src/server/blogs/data.ts` | Shared server data access; own-property slug lookup |
| `src/app/api/blogs/listQuery.ts` | Query-parameter validation rules |
| `src/app/api/blogs/route.ts` | Validate → 400, or list via the data layer |
| `src/app/api/blogs/[slug]/route.ts` | Uses the data layer; 404 body typed |
| `src/app/api/categories/route.ts` | Uses the data layer |
| `src/app/blog/[slug]/page.tsx` | Reads data directly; `notFound()` only when missing |
| `src/lib/blogs/types.ts` | Shared types and response contracts |
| `src/lib/blogs/guards.ts` | Runtime checks for API JSON |
| `src/lib/blogs/urls.ts` | `URLSearchParams`-based URL builders |
| `src/lib/blogs/searchSync.ts` | SearchBar URL/draft and history rules |
| `src/app/blog/utils/fetchData.ts` | Relative browser fetch; failures as typed values |
| `src/app/blog/utils/getBlogsFn.ts`, `getCategoriesFn.ts` | Validate shape; throw with `cause` |
| `src/app/blog/_components/SearchBar.tsx` | URL-driven draft, debounce, history policy |
| `src/app/blog/_components/CategoriesList.tsx` | Keeps search; local error + retry |
| `src/app/blog/_components/PaginatedBlogsList.tsx` | Encoded links; error + retry; readable empty state |
| `src/app/blog/_components/BlogCard.tsx`, `BlogsList.tsx` | Type import path only |
| `src/lib/useDebounce.ts` | Removed (obsolete) |
| `vitest.config.mts`, `src/**/*.test.ts` (7 files) | Test setup and regression tests |
| `package.json`, `package-lock.json` | `vitest` dev dependency and `npm test`. The lockfile adds Vitest's dependency tree. It also bumps two existing packages: `postcss` 8.5.25 → 8.5.28 and `nanoid` 3.3.16 → 3.3.19, because the new `vite` requires `postcss ^8.5.28`. No packages were removed. |
| `eslint.config.mjs` | TypeScript-aware versions of three rules |
| `README.md`, `CLAUDE.md`, `.env.example` | Match the new implementation |

---

## 5. Verification

All commands were run on the final tree unless noted.

### Automated

| Check | Result |
|---|---|
| `npm run lint` | Pass (0 problems) |
| `npx tsc --noEmit` | Pass |
| `npm test` (Vitest) | 7 files, **105 tests passed** |
| `npm run build` with `SITE_URL` unset | Pass; route table identical to the baseline |
| `tsc` + `eslint` on each intermediate commit (`e366206`, `4b557ac`) | Pass |
| Mutation check: reintroduced the plain-object lookup and the "keep stale draft" rule | 12 tests failed as expected, then passed again after restoring |
| Probe file for lint rules | TS-aware rules active (`no-use-before-define` error, `no-unused-vars` warning) |
| `server-only` guard: temporarily imported the data layer into a Client Component | Build failed with the `server-only` error, as intended; reverted |
| Client bundles (`.next/static`) searched for blog store text | Not present (only in `.next/server`) |

### HTTP (production `next start`, `SITE_URL` unset, `VERCEL_PROJECT_PRODUCTION_URL=production-origin.invalid`)

| Request | Result |
|---|---|
| `/api/blogs` (no params) | 200, 1 item (`fourteenth-blog`), `{total:14,page:1,limit:1,hasNextPage:true}` |
| `?page=1&limit=10` / `?page=2&limit=10` | 200; page 2 = fourth, third, second, first (newest first) |
| `?page=99&limit=10`, `?page=9007199254740991&limit=100` | 200, empty `data`, `hasNextPage:false`, finite metadata |
| `page=abc`, `0`, `-1`, `1.5`, empty; `limit=0`, `-1`, empty | 400 `{ "error": "... must be a positive integer" }` |
| `limit=101`, `limit=100000` | 400 `limit must not be greater than 100` |
| `page` / `limit` = `9007199254740993` | 400 `... is too large` |
| `page=1&page=2` | 400 `page must not be repeated` |
| Encoded searches `css&category=nextjs`, `C++`, Arabic | 200, treated as literal text (0 matches, no category filter) |
| `/api/blogs/toString`, `constructor`, `__proto__`, `hasOwnProperty`, `missing` | 404 `{ "error": "Blog not found" }` |
| `/blog/first-blog` | Article rendered |
| `/blog/toString`, `/blog/constructor`, `/blog/missing` | Not-found UI. HTTP status is **200 plus `noindex`**; see limitations. |

### Browser (Chromium via Playwright, against the production build)

| Scenario | Result |
|---|---|
| Search `e` → page 2 → category `typescript` → "all categories", then Back ×4 and Forward ×4 | At every step, URL, input, active category and rendered cards agree with the API for that URL |
| Category change keeps search, resets page; "all categories" keeps search | Pass |
| Type `gen`, then type more and press Back within the 300 ms window | URL `/blog`, input empty; nothing reappears |
| Rapid typing `generics` (30 ms/key) | One commit, one history entry (fresh context) |
| Type `gen`, pause for its commit, type `erics` while it's in flight | Input and URL both `generics`; no letters lost |
| Back after refining `gen` → `generics` | Returns to `/blog`; Forward restores `generics` |
| Clear the search, then Back | Search restored |
| Pending typing + category change | URL `category=css&search=grid`, input `grid` |
| Category + search with no results, then "All Blogs" | `/blog`, input empty, stays cleared |
| Literals `C++`, `css&category=nextjs`, `css#layout`, `flexbox and grid`, `مرحبا بالعالم` | Page URL, API request and input all hold the literal value; no extra `category`. `flexbox and grid` finds "css layout basics". |
| Direct URL `/blog?search=C%2B%2B&page=2` | API receives `search=C++`, `page=2` |
| Pagination href with a search | `/blog?search=e&page=2` |
| Ordering across pages 1–2 | Dates non-increasing; page 1 starts with "offset based pagination", page 2 ends with "typescript mastery" |
| "All Blogs" contrast | Light 17.93:1, dark 15.72:1 |
| `/api/blogs` forced to 500 | "Couldn't load blogs." (no internal text) → remove the fault → **Try again** → 10 cards |
| `/api/categories` forced to 500 | Retry item in the menu; list still shows 10 cards → remove the fault → retry → categories listed |
| Detail pages | Article renders; `toString`, `constructor`, `missing` show "404 - Page Not Found" |

In the long browser run, one check reported that rapid typing added 0 history entries. It was measured in a tab that already had many history entries. A separate check confirmed that Chromium stops counting at 50 entries (`history.length` stays at 50 after further pushes). Re-running in a fresh context showed exactly one entry, and all 7 history checks passed.

### Temporary-fixture checks (production build, reverted afterwards)

| Check | Result |
|---|---|
| Changed one blog's title in the store | List (browser → API) and detail page (server, direct) both showed the changed title; no production-origin dependency |
| Made `getBlogBySlug('second-blog')` throw | `/blog/second-blog` showed "Something went wrong"; not the 404 page; the internal message was not shown (production redaction); the server log recorded it |
| Reverted | Fixture text absent from `src`; store data identical to the baseline |

### Baseline confirmation (before any change, commit `4c40fe2`)

- **API:** `page=abc` → 200 with `meta.page: null`; `page=-1` → 200 with 4 items; `page=1.5` → 9 items; `limit=100000` → all items; `/api/blogs/constructor`, `toString`, `__proto__` → 200 `{"image":"...text=undefined"}`; `/blog/toString` → "Invalid Date".
- **Browser:** after search `zzz`, "All Blogs" stayed at `?search=zzz`. Back after searching `generics` stayed at `?search=generics`. Searching `css&category=nextjs` sent `search=css` and `category=nextjs` to the API.
- **A missing blog also returned HTTP 200 + `noindex` at baseline**, so the status-code limitation below was already there.

### Static inspection only

- **Why the category menu doesn't throw to the route error boundary:** reasoned in §3, not tested separately.
- **`?page=abc` on the `/blog` page itself:** by reading the code, the API returns 400. TanStack Query's default 3 retries (about 7 s) run before the list shows "Couldn't load blogs." with a **Show all blogs** link. Not browser-tested.

---

## 6. Repository state

- **Starting commit:** `4c40fe2b0e60978da5be4e58e7a137bd8f4e14ee`
- **Branch:** `claude/repo-code-review-nv48oi`
- **Commits:**
  1. `e366206`: fix: validate API input, share server data access, classify fetch errors
  2. `4b557ac`: fix: keep search, category and page in sync with the URL
  3. `9394206`: test: add Vitest regression tests and TypeScript-aware lint rules
  4. `ad3c654`: docs: update README, CLAUDE.md and .env.example for the new architecture
  5. This report (hash given in the chat reply)
- **Push status and branch URL:** given in the chat reply.
- **Working tree:** clean. Nothing pre-existing and nothing left over from this task.

---

## 7. Remaining work

### Not verified

- **Preview deployment:** no preview deployment was available, so list/detail consistency on Vercel was **not** verified there. It was verified locally with `VERCEL_PROJECT_PRODUCTION_URL` set to an invalid host.
- **The `/blog?page=abc` experience in a browser** (see §5, "Static inspection only").

### Known limitations (pre-existing, not changed)

- **Detail-page status code.**
  - **What happens:** a missing blog page returns HTTP **200** with `<meta name="robots" content="noindex">`, not 404. `src/app/blog/loading.tsx` makes `/blog/*` responses stream, and Next.js can't change the status after streaming starts; this is documented in `loading.md`, "Status Codes".
  - **Scope:** the API route returns a real 404, and the baseline behaved the same.
  - **To get a true 404:** Next.js suggests checking the slug in `proxy`, or moving the loading boundary so it doesn't wrap the detail page. Both are structural changes and are left for a decision.
- **`npm audit`:** 7 advisories (`fast-uri`, `hono`, `js-yaml`, `next`, `postcss`, `qs`, `sharp`), down from 8 at baseline. Fixing them needs dependency or framework upgrades, which were out of scope.
- **Repeated `?category=` on `/blog`:** `src/app/blog/page.tsx` types `searchParams` values as `string`, but a repeated `?category=a&category=b` arrives as an array. That case isn't handled. The API itself rejects repeated parameters.

### Optional follow-ups (deferred, see §6 of the checklist)

- Skip TanStack Query retries for HTTP 4xx responses. Retrying a request the server has rejected can't succeed.
- Keep previous data during uncached page changes, with a visible pending state.
- Server prefetching/hydration for the list's first render.
- Metadata, semantic `header`/`nav`, the brand link destination, the default page size.
- Rename `categoryProps` / `categoryPropsType` and share the `'all categories'` string between `page.tsx` and `CategoriesList.tsx`.
