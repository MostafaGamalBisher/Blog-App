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

  if (postsArray.length > 0) {
    return (
      <div className="flex flex-col items-center justify-start">
        <h2 className="border-b p-4 font-extrabold">The most recent Blogs</h2>
        <PostsList posts={postsArray} />
      </div>
    );
  } else {
    return <p>Can not find the matched category </p>;
  }
}
