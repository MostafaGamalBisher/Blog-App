'use client';

import { createContext, useContext, useRef, type RefObject } from 'react';

// Lets CategoriesList use what is currently typed in SearchBar, including
// text the debounce has not committed to the URL yet, so choosing a category
// applies that search together with the category.
export interface PendingSearch {
  // Returns the text in the search box and cancels its pending debounce
  // commit, because the caller is about to navigate with that text itself.
  takeDraft: () => string;
}

// A ref rather than state: it is only read when a category is chosen, so
// typing does not need to re-render the category menu.
const SearchDraftContext =
  createContext<RefObject<PendingSearch | null> | null>(null);

export function SearchDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pendingSearchRef = useRef<PendingSearch | null>(null);
  return (
    <SearchDraftContext value={pendingSearchRef}>{children}</SearchDraftContext>
  );
}

export function usePendingSearchRef(): RefObject<PendingSearch | null> {
  const ref = useContext(SearchDraftContext);
  if (ref === null) {
    throw new Error(
      'usePendingSearchRef must be used inside SearchDraftProvider'
    );
  }
  return ref;
}
