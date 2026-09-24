'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateBlogListParams } from '@/lib/blogs/urls';
import {
  initialSearchSync,
  reconcileWithUrl,
  searchHistoryMode,
} from '@/lib/blogs/searchSync';
import { usePendingSearchRef } from '@/app/blog/_components/SearchDraftContext';

const SEARCH_DEBOUNCE_MS = 300;

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pendingSearchRef = usePendingSearchRef();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const query = searchParams.toString();
  const urlSearch = searchParams.get('search') ?? '';

  const [sync, setSync] = useState(() => initialSearchSync(query, urlSearch));

  // The URL is the source of truth. When it changes, bring the input in line
  // during render (React's pattern for adjusting state when a prop changes),
  // so no effect or timer ever sees a stale draft.
  const reconciled = reconcileWithUrl(sync, query, urlSearch);
  if (reconciled !== sync) {
    setSync(reconciled);
  }

  const draft = reconciled.draft;

  // Commit the typed text to the URL after a pause in typing. Any change to
  // the draft or the URL cancels the pending timer and starts a new one with
  // current values.
  useEffect(() => {
    const nextSearch = draft.trim();
    if (nextSearch === urlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const params = updateBlogListParams(searchParams, {
        search: nextSearch || null,
      });
      const nextQuery = params.toString();
      setSync((current) => ({ ...current, pendingQuery: nextQuery }));
      const href = nextQuery ? `/blog?${nextQuery}` : '/blog';
      if (searchHistoryMode(urlSearch, nextSearch) === 'replace') {
        router.replace(href);
      } else {
        router.push(href);
      }
    }, SEARCH_DEBOUNCE_MS);
    timerRef.current = timer;

    return () => {
      clearTimeout(timer);
    };
  }, [draft, urlSearch, searchParams, router]);

  // Clicking a link ("All Blogs", pagination, a blog card...) starts a
  // navigation that supersedes pending typing. Cancel the pending commit at
  // the click: on a slow network the timer could otherwise fire while that
  // navigation is still loading, and its later push would replace the link's
  // destination. (Back/Forward need no handling here: the router applies the
  // restored URL immediately, so the draft is replaced before the timer.)
  useEffect(() => {
    const cancelOnLinkClick = (event: MouseEvent) => {
      const opensElsewhere =
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey;
      if (
        !opensElsewhere &&
        event.target instanceof Element &&
        event.target.closest('a[href]')
      ) {
        clearTimeout(timerRef.current);
      }
    };
    document.addEventListener('click', cancelOnLinkClick, true);
    return () => {
      document.removeEventListener('click', cancelOnLinkClick, true);
    };
  }, []);

  // Let a category selection take the current draft (see SearchDraftContext).
  useEffect(() => {
    pendingSearchRef.current = {
      takeDraft: () => {
        clearTimeout(timerRef.current);
        return draft;
      },
    };
    return () => {
      pendingSearchRef.current = null;
    };
  }, [draft, pendingSearchRef]);

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
