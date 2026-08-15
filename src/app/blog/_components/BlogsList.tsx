import Link from 'next/link';
import { Blog } from '@/app/api/blogs/blogs';
import BlogCard from '@/app/blog/_components/BlogCard';

interface BlogsListProps {
  blogs: Blog[];
}

const BlogsList = ({ blogs }: BlogsListProps) => {
  return (
    <ul className="mt-4 grid grid-cols-1 gap-5 rounded-xl p-4 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <li key={blog.slug} className="h-full">
          <Link className="block h-full" href={`/blog/${blog.slug}`}>
            <BlogCard blog={blog} />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default BlogsList;
