// State rules for SearchBar. The URL's `search` parameter is the committed
// value; `draft` is what is currently typed and waiting for the debounce.

export interface SearchSyncState {
  // Text in the input.
  draft: string;
  // The URL `search` value this state was last reconciled with.
  syncedSearch: string;
  // The value SearchBar itself last navigated to, until the URL shows it.
  pendingSearch: string | null;
}

export function initialSearchSync(urlSearch: string): SearchSyncState {
  return { draft: urlSearch, syncedSearch: urlSearch, pendingSearch: null };
}

// Called whenever the URL's `search` may have changed.
// - Our own navigation arriving (URL === pendingSearch): keep the draft, so
//   anything typed while the navigation was in flight is not lost.
// - Any other change (Back/Forward, "All Blogs" reset, a link): the URL wins
//   and replaces the draft, so a stale draft can never be pushed back.
// Returns the same object when nothing changed.
export function reconcileWithUrl(
  state: SearchSyncState,
  urlSearch: string
): SearchSyncState {
  if (urlSearch === state.syncedSearch) {
    return state;
  }
  const isOwnNavigation = urlSearch === state.pendingSearch;
  return {
    draft: isOwnNavigation ? state.draft : urlSearch,
    syncedSearch: urlSearch,
    pendingSearch: null,
  };
}

// History policy for committing a search:
// - starting a search ('' -> 'gen') or clearing it ('gen' -> '') adds a
//   history entry (push), so Back returns to the previous result set;
// - refining an existing search ('gen' -> 'generics') replaces the current
//   entry, so Back does not step through every partially typed word.
export function searchHistoryMode(
  currentSearch: string,
  nextSearch: string
): 'push' | 'replace' {
  return currentSearch && nextSearch ? 'replace' : 'push';
}
