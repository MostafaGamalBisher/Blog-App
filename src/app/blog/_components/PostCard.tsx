import { Post } from '../posts';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <li className="flex flex-col">
      <h3>{post.title}</h3>
      <p>{post.date.toDateString()}</p>
    </li>
  );
};

export default PostCard;
