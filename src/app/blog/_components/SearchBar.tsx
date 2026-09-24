'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateBlogListHref } from '@/lib/blogs/urls';
import {
  initialSearchSync,
  reconcileWithUrl,
  searchHistoryMode,
} from '@/lib/blogs/searchSync';

const SEARCH_DEBOUNCE_MS = 300;

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlSearch = searchParams.get('search') ?? '';

  const [sync, setSync] = useState(() => initialSearchSync(urlSearch));

  // The URL is the source of truth. When it changes, bring the input in line
  // during render (React's pattern for adjusting state when a prop changes),
  // so no effect or timer ever sees a stale draft.
  const reconciled = reconcileWithUrl(sync, urlSearch);
  if (reconciled !== sync) {
    setSync(reconciled);
  }

  const draft = reconciled.draft;

  // Commit the typed text to the URL after a pause in typing. Any change to
  // the draft or the URL cancels the pending timer and starts a new one with
  // current values, so a timer can never navigate with outdated state.
  useEffect(() => {
    const nextSearch = draft.trim();
    if (nextSearch === urlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      setSync((current) => ({ ...current, pendingSearch: nextSearch }));
      const href = updateBlogListHref(searchParams, {
        search: nextSearch || null,
      });
      if (searchHistoryMode(urlSearch, nextSearch) === 'replace') {
        router.replace(href);
      } else {
        router.push(href);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [draft, urlSearch, searchParams, router]);

  const searchInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSync((current) => ({ ...current, draft: value }));
  };

  return (
    <Input
      type="search"
      placeholder="Search..."
      value={draft}
      onChange={searchInputHandler}
    />
  );
}
