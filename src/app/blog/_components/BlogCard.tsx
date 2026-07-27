import { Blog } from '@/app/api/blogs/blogs';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border p-4">
      <h3 className="text-2xl font-medium text-amber-100">{blog.title}</h3>
      <p className="text-xs">{blog.date.toDateString()}</p>
    </div>
  );
};

export default BlogCard;
