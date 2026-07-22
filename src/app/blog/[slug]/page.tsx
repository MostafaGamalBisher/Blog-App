import { useParams } from 'next/navigation';

interface BlogPostPageProps {
  params: { slug: string };
}

const BlogPage = () => {
  const params = useParams<BlogPostPageProps>();
};

export default BlogPage;
