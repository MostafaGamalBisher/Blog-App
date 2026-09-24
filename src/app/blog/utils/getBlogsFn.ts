import type { Blog, PaginatedResponse } from '@/lib/blogs/types';
import { isPaginatedRawBlogs } from '@/lib/blogs/guards';
import { blogsApiPath, type BlogListFilters } from '@/lib/blogs/urls';
import { describeFetchError, fetchData } from '@/app/blog/utils/fetchData';

// TanStack Query function: throws on failure (that is how useQuery learns
// about errors). The original FetchError is kept as the error's `cause`.
export async function getBlogsFn(
  filters: BlogListFilters & { page?: number }
): Promise<PaginatedResponse<Blog>> {
  const result = await fetchData(blogsApiPath(filters));

  if (!result.ok) {
    throw new Error(
      `Failed to load blogs (${describeFetchError(result.error)})`,
      { cause: result.error }
    );
  }

  if (!isPaginatedRawBlogs(result.data)) {
    throw new Error('Failed to load blogs (unexpected response shape)');
  }

  const { data, meta } = result.data;

  return {
    data: data.map((blog) => ({ ...blog, date: new Date(blog.date) })),
    meta,
  };
}
