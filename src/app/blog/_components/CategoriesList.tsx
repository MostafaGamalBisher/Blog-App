'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { getCategoriesFn } from '@/app/blog/utils/getCategoriesFn';
import { updateBlogListHref } from '@/lib/blogs/urls';

interface categoryPropsType {
  categoryProps: string;
}

export function CategoriesList({ categoryProps }: categoryPropsType) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesFn,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Changing the category keeps the current search and returns to page 1.
  // "all categories" removes only the category filter.
  const categoryHandler = (selectedCategory: string) => {
    router.push(
      updateBlogListHref(searchParams, {
        category:
          selectedCategory === 'all categories' ? null : selectedCategory,
      })
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">Select Category</Button>}
      />
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={categoryProps}
            onValueChange={categoryHandler}
          >
            {isLoading && (
              <DropdownMenuRadioItem value="loading" disabled>
                Loading...
              </DropdownMenuRadioItem>
            )}

            <DropdownMenuRadioItem
              className="font-heading text-xs"
              value="all categories"
            >
              all categories
            </DropdownMenuRadioItem>

            {data?.map((category) => (
              <DropdownMenuRadioItem
                className="font-jura text-xs"
                key={category}
                value={category}
              >
                {category}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          {/* A failed category list only affects this menu, so the error is
              shown here with a retry instead of replacing the whole page.
              The full error stays in the query state. */}
          {isError && (
            <DropdownMenuItem className="text-xs" onClick={() => refetch()}>
              Couldn&apos;t load categories. Retry
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
