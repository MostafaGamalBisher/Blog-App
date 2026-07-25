import Link from 'next/link';
import { Post } from '../posts';
import PostCard from './PostCard';

interface PostsListProps {
  posts: Post[];
}

const PostsList = ({ posts }: PostsListProps) => {
  return (
    <ul className="mt-4 flex flex-row gap-5 rounded-xl bg-blue-950 p-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`}>
            <PostCard post={post} />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default PostsList;
