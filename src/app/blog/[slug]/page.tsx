import { notFound } from 'next/navigation';
import { fetchData } from '@/app/blog/utils/fetchData';
import { RawData } from '@/app/api/blogs/blogs';
import Image from 'next/image';
import { Code } from 'lucide-react';

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

  return (
    <div className="flex flex-col items-start gap-6 p-4 md:items-center">
      <div className="flex flex-col gap-4 self-stretch md:flex-row md:justify-center">
        <Image
          className="h-auto w-full max-w-150 self-stretch rounded-xl md:w-1/2"
          src={blog.image}
          height={400}
          width={600}
          alt={blog.title}
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-primary font-mono text-2xl font-bold">
            {blog.title}
          </h1>
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
      </div>
      <p className="font-sans">{blog.content}</p>
    </div>
  );
}
