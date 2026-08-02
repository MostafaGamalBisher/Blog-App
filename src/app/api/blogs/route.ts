import { NextResponse } from 'next/server';
import blogs from '@/app/api/blogs/blogs';

export function GET(request: Request) {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const limit = url.searchParams.get('limit');

  const pageNumber = Number(page ?? '1');
  const pageLimit = Number(limit ?? '1');

  const start = (pageNumber - 1) * pageLimit;
  const end = start + pageLimit;

  const rowArray = Object.values(blogs);

  const totalArrayLength = rowArray.length

  const slicedArray = rowArray.slice(start,end)

  return NextResponse.json({
  data: slicedArray,
  meta: {
    total: totalArrayLength,
    page: pageNumber,
    limit: pageLimit,
    hasNextPage: /* ... */,
  },
});
}
