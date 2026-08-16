import { NextResponse } from 'next/server';
import blogs, { Blog, SentRawData } from '@/app/api/blogs/blogs';

export function GET(request: Request) {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const limit = url.searchParams.get('limit');
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search')?.trim().toLowerCase();

  const pageNumber = Number(page ?? '1');
  const pageLimit = Number(limit ?? '1');

  const start = (pageNumber - 1) * pageLimit;
  const end = start + pageLimit;

  const blogsArray = Object.values(blogs);

  const filteredBlogsArray = category
    ? blogsArray.filter((blog) => blog.category === category)
    : blogsArray;

  const searchedFilteredBlogsArray = search
    ? filteredBlogsArray.filter(
        (blog) =>
          blog.title.toLowerCase().includes(search) ||
          blog.content.toLowerCase().includes(search)
      )
    : filteredBlogsArray;

  const blogsArrayLength = searchedFilteredBlogsArray.length;

  const slicedBlogsArray = searchedFilteredBlogsArray.slice(start, end);

  const slicedBlogsArrayWithImage = slicedBlogsArray.map((blog) => ({
    ...blog,
    image: `https://placehold.co/600x400.png?text=${blog.slug}`,
  }));

  return NextResponse.json<SentRawData<Blog[]>>({
    data: slicedBlogsArrayWithImage,
    meta: {
      total: blogsArrayLength,
      page: pageNumber,
      limit: pageLimit,
      hasNextPage: end < blogsArrayLength,
    },
  });
}
