import { NextResponse } from 'next/server';
import blogs from '@/app/api/blogs/blogs';

export function GET() {
  return NextResponse.json(Object.values(blogs));
}
