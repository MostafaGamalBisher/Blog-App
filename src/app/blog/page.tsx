import { CategoriesList } from '@/app/blog/_components/CategoriesList';
import { PaginatedBlogsList } from '@/app/blog/_components/PaginatedBlogsList';

interface BlogsListPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogListPage({
  searchParams,
}: BlogsListPageProps) {
  const { category, page } = await searchParams;

  const categoryProps: string = category ?? 'all categories';

  return (
    <div className="flex flex-col items-center justify-start">
      <CategoriesList categoryProps={categoryProps} />
      <PaginatedBlogsList page={page} category={category} />
    </div>
  );
}
