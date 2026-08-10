import Link from 'next/link';
import BlogsList from '@/app/blog/_components/BlogsList';
import { fetchData } from '@/app/blog/utils/fetchData';
import { Blog, RawData, SentRawData } from '@/app/api/blogs/blogs';
import { CategoriesList } from './_components/CategoriesList';

interface BlogsListPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogListPage({
  searchParams,
}: BlogsListPageProps) {
  const { category, page } = await searchParams;

  const categoryProps: string = category ?? 'all categories';

  const categoryQuery = category ? `&category=${category}` : '';

  const result = await fetchData<SentRawData<RawData[]>>(
    `/api/blogs?page=${page ?? '1'}&limit=10${categoryQuery}`
  );

  if (!result.ok) {
    throw new Error(`Failed to fetch Blogs`);
  }

  const { data, meta } = result.data;

  if (!meta) {
    throw new Error(`meta data is not provided`);
  }

  const allBlogs: Blog[] = data.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));

  if (allBlogs.length === 0) {
    return (
      <div>
        <p>No Blogs to render</p>
        <Link href={`/blog`}>
          <h3 className="text-white">All Blogs</h3>
        </Link>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-start">
        <h2 className="border-b p-4 font-extrabold">The most recent Blogs</h2>
        <CategoriesList categoryProps={categoryProps} />

        <BlogsList blogs={allBlogs} />

        <div className="flex gap-4">
          {meta.page === 1 ? (
            <p className="pointer-events-none opacity-50 select-none">prev</p>
          ) : (
            <Link href={`/blog?page=${meta.page - 1}${categoryQuery}`}>
              Prev
            </Link>
          )}
          {meta.hasNextPage ? (
            <Link href={`/blog?page=${meta.page + 1}${categoryQuery}`}>
              Next
            </Link>
          ) : (
            <p className="pointer-events-none opacity-50 select-none">Next</p>
          )}
        </div>
      </div>
    );
  }
}
