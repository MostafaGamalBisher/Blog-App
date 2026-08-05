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

  if (categorizedBlogs.length > 0) {
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
        <BlogsList blogs={categorizedBlogs} />

        <div>
          <Link href={`/blog?page=${meta.page + 1}${categoryQuery}`}>Next</Link>
        </div>
      </div>
    );
  } else {
    return <p>Can not find the matched category </p>;
  }
}
