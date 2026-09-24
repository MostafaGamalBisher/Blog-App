import 'server-only';
import blogs from '@/server/blogs/store';
import type { Blog } from '@/lib/blogs/types';
import {
  queryBlogs,
  withImage,
  type BlogListQuery,
} from '@/server/blogs/query';

// Server-side data access, shared by the API route handlers and Server
// Components. Server Components call these directly instead of fetching the
// app's own API over HTTP. The functions are async so callers don't change
// when the in-memory store is replaced by a real database.

export async function listBlogs(query: BlogListQuery) {
  return queryBlogs(Object.values(blogs), query);
}

// Returns null when no blog has this slug. `Object.hasOwn` makes sure
// inherited keys such as `constructor` or `toString` are not treated as blogs.
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  if (!Object.hasOwn(blogs, slug)) {
    return null;
  }
  return withImage(blogs[slug]);
}

export async function listCategories(): Promise<string[]> {
  return [...new Set(Object.values(blogs).map((blog) => blog.category))];
}
