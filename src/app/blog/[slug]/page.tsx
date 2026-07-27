import { notFound } from 'next/navigation';
import BlogCard from '@/app/blog/_components/BlogCard';
import blogs from '@/app/api/blogs/blogs';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = blogs[slug];

  if (blog === undefined) {
    notFound();
  }

  return <BlogCard key={slug} blog={blog} />;
}
