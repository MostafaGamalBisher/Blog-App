import { Blog } from '@/app/api/blogs/blogs';
import { Code } from 'lucide-react';
import Image from 'next/image';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <div className="flex h-full flex-col items-start gap-4 rounded-2xl border p-4">
      <Image
        className="h-auto w-full self-stretch rounded-xl"
        src={blog.image}
        height={400}
        width={600}
        alt={blog.title}
      />

      <h2 className="text-primary font-heading line-clamp-2 text-2xl font-bold">
        {blog.title}
      </h2>
      <div className="flex flex-col items-start">
        <div className="font-jura flex items-center gap-1 rounded-xl border p-1 text-xs font-light">
          <p>{blog.category}</p>
          <Code height={10} width={10} />
        </div>
        <p className="font-jura rounded-xl p-1 pr-2 pl-2 text-sm font-light">
          {blog.date.toDateString()}
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
