import type { Blog, PaginatedResponse, StoredBlog } from '@/lib/blogs/types';

// A validated list request. The API layer (src/app/api/blogs/listQuery.ts)
// guarantees `page` and `limit` are positive safe integers.
export interface BlogListQuery {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}

export function withImage(blog: StoredBlog): Blog {
  return {
    ...blog,
    image: `https://placehold.co/600x400.png?text=${encodeURIComponent(blog.slug)}`,
  };
}

// Newest first. Blogs with the same date are ordered by slug so the order
// (and therefore which blog lands on which page) is always the same.
export function compareNewestFirst(a: StoredBlog, b: StoredBlog): number {
  const byDate = b.date.getTime() - a.date.getTime();
  if (byDate !== 0) {
    return byDate;
  }
  if (a.slug === b.slug) {
    return 0;
  }
  return a.slug < b.slug ? -1 : 1;
}

// Filter -> sort -> paginate. Filtering and sorting run before slicing, so
// `total`, `hasNextPage` and page contents describe the filtered, ordered set.
// Pure: `source` is never mutated.
export function queryBlogs(
  source: readonly StoredBlog[],
  { page, limit, category, search }: BlogListQuery
): PaginatedResponse<Blog> {
  const needle = search?.trim().toLowerCase();

  const matching = source.filter(
    (blog) =>
      (!category || blog.category === category) &&
      (!needle ||
        blog.title.toLowerCase().includes(needle) ||
        blog.content.toLowerCase().includes(needle))
  );
  const ordered = [...matching].sort(compareNewestFirst);
  const total = ordered.length;

  // A page past the end is a valid request with no results. Checking it
  // against the page count first means a huge `page` never produces a huge
  // (unsafe) offset.
  const pageCount = Math.ceil(total / limit);
  if (page > pageCount) {
    return { data: [], meta: { total, page, limit, hasNextPage: false } };
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: ordered.slice(start, end).map(withImage),
    meta: { total, page, limit, hasNextPage: end < total },
  };
}
