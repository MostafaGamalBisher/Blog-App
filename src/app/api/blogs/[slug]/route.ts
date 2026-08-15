import { NextResponse } from 'next/server';
import blogs, { Blog } from '@/app/api/blogs/blogs';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const blog = blogs[slug];

  if (blog === undefined) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  const blogWithImage = {
    ...blog,
    image: `https://placehold.co/600x400.png?text=${blog.slug}`,
  };

  return NextResponse.json<Blog>(blogWithImage);
}
