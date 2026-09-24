import { NextResponse } from 'next/server';
import { getBlogBySlug } from '@/server/blogs/data';
import type { ApiErrorResponse, Blog } from '@/lib/blogs/types';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const blog = await getBlogBySlug(slug);

  if (blog === null) {
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Blog not found' },
      { status: 404 }
    );
  }

  return NextResponse.json<Blog>(blog);
}
