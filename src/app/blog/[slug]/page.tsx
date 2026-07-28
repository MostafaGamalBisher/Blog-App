import { notFound } from 'next/navigation';
import BlogCard from '@/app/blog/_components/BlogCard';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  const response = await fetch(`${process.env.SITE_URL}/api/blogs/${slug}`);

  if (!response.ok) {
    notFound();
  }

  const rowData = await response.json();

  const blog = {
    ...rowData,
    date: new Date(rowData.date),
  };

  return <BlogCard key={slug} blog={blog} />;
}
