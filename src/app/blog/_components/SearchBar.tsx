'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/lib/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchBar() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const [searchInput, setSearchInput] = useState<string>(
    searchParams.get('search') ?? ''
  );

  const debouncedValue = useDebounce<string>(searchInput, 300);

  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? '';

    const trimmedDebouncedValue = debouncedValue.trim();

    if (currentSearch === trimmedDebouncedValue) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (trimmedDebouncedValue) {
      params.set('search', trimmedDebouncedValue);
    } else {
      params.delete('search');
    }

    params.delete('page');

    router.push(`/blog?${params.toString()}`);
  }, [debouncedValue, router, searchParams]);

  const searchInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  return (
    <Input
      type="search"
      placeholder="Search..."
      value={searchInput}
      onChange={searchInputHandler}
    />
  );
}
