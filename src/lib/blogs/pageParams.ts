import {
  optionalFilter,
  positiveInteger,
  type Parsed,
} from '@/lib/blogs/queryParams';

// The /blog page's searchParams exactly as Next.js provides them: a
// parameter can be absent, a single string, or an array when it is repeated
// (`?search=a&search=b`).
export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface BlogPageFilters {
  category?: string;
  search?: string;
  page: number;
}

function valuesOf(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

// Validates the /blog URL before anything reaches components, query keys or
// URL builders. Same rules as GET /api/blogs: a repeated search, category or
// page (even with identical values) is invalid, as is a page that is not a
// plain positive integer. Absent or empty search/category means no filter.
// Other parameters are ignored.
export function parseBlogPageParams(
  params: RawSearchParams
): Parsed<BlogPageFilters> {
  const search = optionalFilter('search', valuesOf(params.search));
  if (!search.ok) {
    return search;
  }

  const category = optionalFilter('category', valuesOf(params.category));
  if (!category.ok) {
    return category;
  }

  const page = positiveInteger('page', valuesOf(params.page), 1);
  if (!page.ok) {
    return page;
  }

  return {
    ok: true,
    value: { search: search.value, category: category.value, page: page.value },
  };
}
