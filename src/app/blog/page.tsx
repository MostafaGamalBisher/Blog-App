import Link from 'next/link';
import BlogsList from '@/app/blog/_components/BlogsList';

export interface Blog {
  title: string;
  slug: string;
  date: Date;
  content: string;
  category: string;
}

export interface RowData {
  title: string;
  slug: string;
  date: string;
  content: string;
  category: string;
}

interface BlogsListPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogListPage({
  searchParams,
}: BlogsListPageProps) {
  const { category } = await searchParams;

  const response = await fetch(`${process.env.SITE_URL}/api/blogs`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Blogs`);
  }

  const rawData: RowData[] = await response.json();

  const data: Blog[] = rawData.map((blog) => ({
    ...blog,
    date: new Date(blog.date),
  }));

  const blogsArray = category
    ? data.filter((blog) => blog.category === category)
    : data;

  const categoriesArray = [...new Set(data.map((blog) => blog.category))];

  if (blogsArray.length > 0) {
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
        <BlogsList blogs={blogsArray} />
      </div>
    );
  } else {
    return <p>Can not find the matched category </p>;
  }
}
