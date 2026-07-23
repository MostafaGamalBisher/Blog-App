import PostsList from './_components/PostsList';
import posts from './posts';

const postsArray = Object.values(posts);

const BlogListPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="font-extrabold">The most recent Blogs</h2>
      <PostsList posts={postsArray} />
    </div>
  );
};

export default BlogListPage;
