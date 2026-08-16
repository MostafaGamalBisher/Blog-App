import { Blog, RawData, SentRawData } from '@/app/api/blogs/blogs';
import { fetchData } from '@/app/blog/utils/fetchData';

interface urlVariables {
  page?: string;
  category?: string;
  search?: string;
}

export async function getBlogsFn({ page, category, search }: urlVariables) {
  const categoryQuery = category ? `&category=${category}` : '';
  const searchQuery = search ? `&search=${search}` : '';
  const result = await fetchData<SentRawData<RawData[]>>(
    `/api/blogs?page=${page ?? '1'}&limit=10${categoryQuery}${searchQuery}`
  );

  if (!result.ok) {
    throw new Error(`Failed to fetch Blogs`);
  }

  const { data, meta } = result.data;

  if (!meta) {
    throw new Error(`meta data is not provided`);
  }

  const allBlogs: Blog[] = data.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));

  return {
    data: allBlogs,
    meta: meta,
  };
}
