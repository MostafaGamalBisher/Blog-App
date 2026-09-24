import { NextResponse } from 'next/server';
import { parseBlogListQuery } from '@/app/api/blogs/listQuery';
import { listBlogs } from '@/server/blogs/data';
import type {
  ApiErrorResponse,
  Blog,
  PaginatedResponse,
} from '@/lib/blogs/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = parseBlogListQuery(searchParams);

  if (!query.ok) {
    return NextResponse.json<ApiErrorResponse>(
      { error: query.error },
      { status: 400 }
    );
  }

  const result = await listBlogs(query.value);

  return NextResponse.json<PaginatedResponse<Blog>>(result);
}
