import { isStringList } from '@/lib/blogs/guards';
import { describeFetchError, fetchData } from '@/app/blog/utils/fetchData';

// TanStack Query function: throws on failure, keeping the FetchError as `cause`.
export async function getCategoriesFn(): Promise<string[]> {
  const result = await fetchData('/api/categories');

  if (!result.ok) {
    throw new Error(
      `Failed to load categories (${describeFetchError(result.error)})`,
      { cause: result.error }
    );
  }

  if (!isStringList(result.data)) {
    throw new Error('Failed to load categories (unexpected response shape)');
  }

  return result.data.data;
}
