import { NextResponse } from 'next/server';
import blogs from '@/app/api/blogs/blogs';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const blog = blogs[slug];

  if (blog === undefined) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  return NextResponse.json(blog);
}
