import Link from 'next/link';
import { Blog } from '@/app/api/blogs/blogs';
import BlogCard from '@/app/blog/_components/BlogCard';

interface BlogsListProps {
  blogs: Blog[];
}

const BlogsList = ({ blogs }: BlogsListProps) => {
  return (
    <ul className="mt-4 flex flex-row gap-5 rounded-xl bg-blue-950 p-4">
      {blogs.map((blog) => (
        <li key={blog.slug}>
          <Link href={`/blog/${blog.slug}`}>
            <BlogCard blog={blog} />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default BlogsList;
