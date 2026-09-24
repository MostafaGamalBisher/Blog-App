// URL builders for the /blog list page and the blogs API.
// Every value goes through URLSearchParams, so user input such as `C++`,
// `a&b` or `#` stays literal text instead of changing the URL's structure.

export interface BlogListFilters {
  category?: string;
  search?: string;
}

export const BLOGS_PAGE_SIZE = 10;

function setIfPresent(params: URLSearchParams, key: string, value?: string) {
  if (value) {
    params.set(key, value);
  }
}

function withQuery(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

// Href for the /blog list page. Page 1 is the default, so it is left out.
export function blogListHref({
  category,
  search,
  page,
}: BlogListFilters & { page?: number }): string {
  const params = new URLSearchParams();
  setIfPresent(params, 'category', category);
  setIfPresent(params, 'search', search);
  if (page !== undefined && page > 1) {
    params.set('page', String(page));
  }
  return withQuery('/blog', params);
}

// Path for GET /api/blogs as requested by the list page.
export function blogsApiPath({
  category,
  search,
  page,
}: BlogListFilters & { page?: number }): string {
  const params = new URLSearchParams();
  params.set('page', String(page ?? 1));
  params.set('limit', String(BLOGS_PAGE_SIZE));
  setIfPresent(params, 'category', category);
  setIfPresent(params, 'search', search);
  return withQuery('/api/blogs', params);
}

// Changes filters on the current /blog URL. A string sets the filter,
// `null` or '' removes it, and filters not mentioned are kept as they are.
// Any filter change goes back to page 1.
export function updateBlogListParams(
  current: URLSearchParams,
  changes: { category?: string | null; search?: string | null }
): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) {
      continue;
    }
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }
  params.delete('page');
  return params;
}

// Same as updateBlogListParams, as an href.
export function updateBlogListHref(
  current: URLSearchParams,
  changes: { category?: string | null; search?: string | null }
): string {
  return withQuery('/blog', updateBlogListParams(current, changes));
}
