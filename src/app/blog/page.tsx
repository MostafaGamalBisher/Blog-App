import PostsList from './_components/PostsList';
import posts from './posts';

const postsArray = Object.values(posts);

const BlogListPage = () => {
  return (
    <div>
      <h2>the most recent Blogs</h2>
      <PostsList posts={postsArray} />
    </div>
  );
};

export default BlogListPage;
