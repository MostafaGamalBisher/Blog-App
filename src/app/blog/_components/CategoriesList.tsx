'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { getCategoriesFn } from '@/app/blog/utils/getCategoriesFn';

interface categoryPropsType {
  categoryProps: string;
}

export function CategoriesList({ categoryProps }: categoryPropsType) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesFn,
  });

  const router = useRouter();

  if (error) {
    throw new Error();
  }

  const categoryHandler = (selectedCategory: string) => {
    if (selectedCategory === 'all categories') {
      router.push(`/blog`);
    } else {
      router.push(`/blog?category=${selectedCategory}`);
    }
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

            <DropdownMenuRadioItem value="all categories">
              all categories
            </DropdownMenuRadioItem>

            {data?.map((category) => (
              <DropdownMenuRadioItem key={category} value={category}>
                {category}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
