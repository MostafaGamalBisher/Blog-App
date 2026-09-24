'use client';

import Link from 'next/link';
import { getBlogsFn } from '@/app/blog/utils/getBlogsFn';
import { useQuery } from '@tanstack/react-query';
import BlogsList from '@/app/blog/_components/BlogsList';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogListHref } from '@/lib/blogs/urls';

interface PaginatedBlogsListProps {
  page: number;
  category?: string;
  search?: string;
}

export function PaginatedBlogsList({
  page,
  category,
  search,
}: PaginatedBlogsListProps) {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['blogs', { page, category, search }],
    queryFn: () => getBlogsFn({ page, category, search }),
  });

  if (isPending) {
    return <p>loading...</p>;
  }

  // Failure details stay on the query's error object; users get a plain
  // message, a retry, and a way back to the unfiltered list.
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <p>Couldn&apos;t load blogs.</p>
        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          Try again
        </Button>
        <Link className="text-primary underline" href={blogListHref({})}>
          Show all blogs
        </Link>
      </div>
    );
  }

  const allBlogs = data.data;
  const meta = data.meta;

  if (allBlogs.length === 0) {
    return (
      <div>
        <p>No Blogs to render</p>
        {/* Resets everything: clears search and category, back to page 1. */}
        <Link href={blogListHref({})}>
          <h3 className="text-primary">All Blogs</h3>
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
          <Link href={blogListHref({ category, search, page: meta.page - 1 })}>
            <ArrowBigLeft />
          </Link>
        )}
        {meta.hasNextPage ? (
          <Link href={blogListHref({ category, search, page: meta.page + 1 })}>
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
