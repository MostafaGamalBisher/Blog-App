'use client';

import Link from 'next/link';
import { getBlogsFn } from '@/app/blog/utils/getBlogsFn';
import { useQuery } from '@tanstack/react-query';
import BlogsList from '@/app/blog/_components/BlogsList';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';

interface PaginatedBlogsListProps {
  page?: string;
  category?: string;
  search?: string;
}

export function PaginatedBlogsList({
  page,
  category,
  search,
}: PaginatedBlogsListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', { page, category, search }],
    queryFn: () => getBlogsFn({ page, category, search }),
  });

  const categoryQuery = category ? `&category=${category}` : '';
  const searchQuery = search ? `&search=${search}` : '';

  if (isLoading) {
    return <p>loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  if (!data) {
    throw new Error('no data found');
  }

  const allBlogs = data.data;
  const meta = data.meta;

  if (allBlogs.length === 0) {
    return (
      <div>
        <p>No Blogs to render</p>
        <Link href={`/blog`}>
          <h3 className="text-white">All Blogs</h3>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="border-b p-4 font-extrabold">The most recent Blogs</h2>

      <BlogsList blogs={allBlogs} />

      <div className="flex gap-4">
        {meta.page === 1 ? (
          <p className="pointer-events-none opacity-50 select-none">
            <ArrowBigLeft />
          </p>
        ) : (
          <Link
            href={`/blog?page=${meta.page - 1}${categoryQuery}${searchQuery}`}
          >
            <ArrowBigLeft />
          </Link>
        )}
        {meta.hasNextPage ? (
          <Link
            href={`/blog?page=${meta.page + 1}${categoryQuery}${searchQuery}`}
          >
            <ArrowBigRight />
          </Link>
        ) : (
          <p className="pointer-events-none opacity-50 select-none">
            <ArrowBigRight />
          </p>
        )}
      </div>
    </>
  );
}
