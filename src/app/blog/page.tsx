import Link from 'next/link';
import BlogsList from '@/app/blog/_components/BlogsList';
import { fetchData } from '@/app/blog/fetchData';
import { Blog, RawData, SentRawData } from '@/app/api/blogs/blogs';

interface BlogsListPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogListPage({
  searchParams,
}: BlogsListPageProps) {
  const { category, page } = await searchParams;

  const categoryQuery = category ? `&category=${category}` : '';

  const result = await fetchData<SentRawData<RawData[]>>(
    `${process.env.SITE_URL}/api/blogs?page=${page ?? '1'}&limit=10`
  );

  if (!result.ok) {
    throw new Error(`Failed to fetch Blogs`);
  }
  const { data, meta } = result.data;

  const allBlogs: Blog[] = data.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));

  const categorizedBlogs = category
    ? allBlogs.filter((blog) => blog.category === category)
    : allBlogs;

  const categoriesArray = [...new Set(allBlogs.map((blog) => blog.category))];

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
        <ul className="m-4 flex flex-row items-center justify-center gap-4 rounded-2xl border-2 p-4">
          <li className="m-4 rounded-2xl border-2 bg-blue-300 p-4 text-xl">
            <Link href={`/blog`}>
              <h3 className="text-black">All Blogs</h3>
            </Link>
          </li>
          {categoriesArray.map((categoryName) => (
            <li
              key={categoryName}
              className="m-4 rounded-2xl border-2 bg-blue-300 p-4 text-xl"
            >
              <Link href={`/blog?category=${categoryName}`}>
                <h3 className="text-black">{categoryName}</h3>
              </Link>
            </li>
          ))}
        </ul>
        {categorizedBlogs.length > 0 ? (
          <BlogsList blogs={categorizedBlogs} />
        ) : (
          <p>
            No Blogs in this category to render please choose another category
          </p>
        )}

        <div>
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
