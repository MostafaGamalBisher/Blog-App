import { NextResponse } from 'next/server';
import blogs, { SentRawData } from '@/app/api/blogs/blogs';

export function GET() {
  const categoriesArray = [
    ...new Set(Object.values(blogs).map((blog) => blog.category)),
  ];

  return NextResponse.json<SentRawData<string[]>>({ data: categoriesArray });
}
