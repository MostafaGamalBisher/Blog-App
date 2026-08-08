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
import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { getCategoriesFn } from '@/app/blog/utils/getCategoriesFn';

export function CategoriesList() {
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesFn,
  });

  if (error) {
    console.log(error);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">Select Category</Button>}
      />
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            {isLoading && (
              <DropdownMenuRadioItem value="loading" disabled>
                Loading...
              </DropdownMenuRadioItem>
            )}

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
