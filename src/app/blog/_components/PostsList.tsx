import { Post } from '../posts';
import PostCard from './PostCard';

interface PostsListProps {
  posts: Post[];
}

const PostsList = ({ posts }: PostsListProps) => {
  return (
    <ul className="flex flex-row gap-5">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </ul>
  );
};

export default PostsList;
