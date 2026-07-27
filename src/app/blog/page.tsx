import Link from 'next/link';
import PostsList from './_components/PostsList';
import posts from './posts';

interface BlogListPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogListPage({
  searchParams,
}: BlogListPageProps) {
  const { category } = await searchParams;

  const postsArray = category
    ? Object.values(posts).filter((post) => post.category === category)
    : Object.values(posts);

  const categoriesArray = [
    ...new Set(Object.values(posts).map((post) => post.category)),
  ];

  if (postsArray.length > 0) {
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
        <PostsList posts={postsArray} />
      </div>
    );
  } else {
    return <p>Can not find the matched category </p>;
  }
}
