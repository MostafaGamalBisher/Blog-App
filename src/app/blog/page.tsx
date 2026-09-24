import Link from 'next/link';
import { CategoriesList } from '@/app/blog/_components/CategoriesList';
import { PaginatedBlogsList } from '@/app/blog/_components/PaginatedBlogsList';
import { SearchBar } from '@/app/blog/_components/SearchBar';
import {
  parseBlogPageParams,
  type RawSearchParams,
} from '@/lib/blogs/pageParams';
import { blogListHref } from '@/lib/blogs/urls';

interface BlogsListPageProps {
  searchParams: Promise<RawSearchParams>;
}

export default async function BlogListPage({
  searchParams,
}: BlogsListPageProps) {
  // Validate the URL first: a repeated parameter arrives as an array and
  // must not reach components, query keys or URL builders.
  const filters = parseBlogPageParams(await searchParams);

  if (!filters.ok) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <h2 className="font-bold">This link has invalid filters</h2>
        <p>{filters.error}.</p>
        <Link className="text-primary underline" href={blogListHref({})}>
          Show all blogs
        </Link>
      </div>
    );
  }

  const { category, page, search } = filters.value;

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
