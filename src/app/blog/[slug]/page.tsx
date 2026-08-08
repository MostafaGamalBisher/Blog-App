import { notFound } from 'next/navigation';
import BlogCard from '@/app/blog/_components/BlogCard';
import { fetchData } from '@/app/blog/utils/fetchData';
import { RawData } from '@/app/api/blogs/blogs';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  const result = await fetchData<RawData>(`/api/blogs/${slug}`);

  if (!result.ok) {
    notFound();
  }

  const blog = {
    ...result.data,
    date: new Date(result.data.date),
  };

  return <BlogCard key={slug} blog={blog} />;
}
