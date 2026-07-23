import { notFound } from 'next/navigation';
import PostCard from '../_components/PostCard';
import posts from '../posts';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts[slug];

  if (post === undefined) {
    notFound();
  }

  return <PostCard key={slug} post={post} />;
}
