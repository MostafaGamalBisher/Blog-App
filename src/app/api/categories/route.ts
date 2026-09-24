import { NextResponse } from 'next/server';
import { listCategories } from '@/server/blogs/data';
import type { ListResponse } from '@/lib/blogs/types';

export async function GET() {
  const categories = await listCategories();

  return NextResponse.json<ListResponse<string>>({ data: categories });
}
