import { CategoriesList } from '@/app/blog/_components/CategoriesList';
import { PaginatedBlogsList } from '@/app/blog/_components/PaginatedBlogsList';
import { SearchBar } from './_components/SearchBar';

interface BlogsListPageProps {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}

export default async function BlogListPage({
  searchParams,
}: BlogsListPageProps) {
  const { category, page, search } = await searchParams;

  const categoryProps: string = category ?? 'all categories';

  return (
    <div className="flex flex-col items-center justify-start">
      <div className="flex gap-4">
        <CategoriesList categoryProps={categoryProps} />
        <SearchBar />
      </div>

      <PaginatedBlogsList page={page} category={category} search={search} />
    </div>
  );
}
