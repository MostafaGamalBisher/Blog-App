import { NextResponse } from 'next/server';
import blogs, { Blog, SentRawData } from '@/app/api/blogs/blogs';

export function GET(request: Request) {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const limit = url.searchParams.get('limit');

  const pageNumber = Number(page ?? '1');
  const pageLimit = Number(limit ?? '1');

  const start = (pageNumber - 1) * pageLimit;
  const end = start + pageLimit;

  const blogsArray = Object.values(blogs);

  const blogsArrayLength = blogsArray.length;

  const slicedBlogsArray = blogsArray.slice(start, end);
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
  console.log('VERCEL_URL:', process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return NextResponse.json<SentRawData<Blog[]>>({
    data: slicedBlogsArray,
    meta: {
      total: blogsArrayLength,
      page: pageNumber,
      limit: pageLimit,
      hasNextPage: end < blogsArrayLength,
    },
  });
}
