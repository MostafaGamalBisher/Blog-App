import { Post } from '../posts';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border p-4">
      <h3 className="text-2xl font-medium text-amber-100">{post.title}</h3>
      <p className="text-xs">{post.date.toDateString()}</p>
    </div>
  );
};

export default PostCard;
