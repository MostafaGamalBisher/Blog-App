import type { BlogListQuery } from '@/server/blogs/query';

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

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 1;
export const MAX_LIMIT = 100;

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const PLAIN_POSITIVE_INTEGER = /^[1-9][0-9]*$/;

function singleValue(
  params: URLSearchParams,
  key: string
): Parsed<string | undefined> {
  const values = params.getAll(key);
  if (values.length > 1) {
    return { ok: false, error: `${key} must not be repeated` };
  }
  return { ok: true, value: values[0] };
}

function positiveInteger(
  params: URLSearchParams,
  key: string,
  fallback: number
): Parsed<number> {
  const raw = singleValue(params, key);
  if (!raw.ok) {
    return raw;
  }
  if (raw.value === undefined) {
    return { ok: true, value: fallback };
  }
  if (!PLAIN_POSITIVE_INTEGER.test(raw.value)) {
    return { ok: false, error: `${key} must be a positive integer` };
  }
  const value = Number(raw.value);
  if (!Number.isSafeInteger(value)) {
    return { ok: false, error: `${key} is too large` };
  }
  return { ok: true, value };
}

export function parseBlogListQuery(
  params: URLSearchParams
): Parsed<BlogListQuery> {
  const page = positiveInteger(params, 'page', DEFAULT_PAGE);
  if (!page.ok) {
    return page;
  }

  const limit = positiveInteger(params, 'limit', DEFAULT_LIMIT);
  if (!limit.ok) {
    return limit;
  }
  if (limit.value > MAX_LIMIT) {
    return { ok: false, error: `limit must not be greater than ${MAX_LIMIT}` };
  }

  const category = singleValue(params, 'category');
  if (!category.ok) {
    return category;
  }

  const search = singleValue(params, 'search');
  if (!search.ok) {
    return search;
  }

  return {
    ok: true,
    value: {
      page: page.value,
      limit: limit.value,
      category: category.value || undefined,
      search: search.value?.trim() || undefined,
    },
  };
}
