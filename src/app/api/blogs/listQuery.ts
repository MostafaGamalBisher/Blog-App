import type { BlogListQuery } from '@/server/blogs/query';
import {
  optionalFilter,
  positiveInteger,
  type Parsed,
} from '@/lib/blogs/queryParams';

// Validation rules for GET /api/blogs query parameters.
//
// page, limit
//   - absent            -> default (page 1, limit 1)
//   - present           -> must be a positive integer written as plain digits
//                          (no sign, decimals, spaces or leading zeros) and a
//                          safe integer; limit must also be <= MAX_LIMIT
//   - empty (`page=`)   -> invalid: only an absent parameter gets the default
// category, search
//   - absent or empty   -> no filter (search is also trimmed)
// Any parameter above given more than once -> invalid.
//
// Invalid input is rejected with a 400; values are never silently adjusted.
// The per-parameter rules live in src/lib/blogs/queryParams.ts and are shared
// with the /blog page.

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 1;
export const MAX_LIMIT = 100;

export function parseBlogListQuery(
  params: URLSearchParams
): Parsed<BlogListQuery> {
  const page = positiveInteger('page', params.getAll('page'), DEFAULT_PAGE);
  if (!page.ok) {
    return page;
  }

  const limit = positiveInteger('limit', params.getAll('limit'), DEFAULT_LIMIT);
  if (!limit.ok) {
    return limit;
  }
  if (limit.value > MAX_LIMIT) {
    return { ok: false, error: `limit must not be greater than ${MAX_LIMIT}` };
  }

  const category = optionalFilter('category', params.getAll('category'));
  if (!category.ok) {
    return category;
  }

  const search = optionalFilter('search', params.getAll('search'));
  if (!search.ok) {
    return search;
  }

  return {
    ok: true,
    value: {
      page: page.value,
      limit: limit.value,
      category: category.value,
      search: search.value?.trim() || undefined,
    },
  };
}
