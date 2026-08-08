import { SentRawData } from '@/app/api/blogs/blogs';
import { fetchData } from '@/app/blog/utils/fetchData';

export async function getCategoriesFn() {
  const result = await fetchData<SentRawData<string[]>>(`/api/categories`);

  if (!result.ok) {
    throw new Error(`Failed to fetch categories`);
  }

  const categoriesArray = result.data.data;

  return categoriesArray;
}
