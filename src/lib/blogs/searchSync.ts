// State rules for SearchBar. The URL's `search` parameter is the committed
// value; `draft` is what is currently typed and waiting for the debounce.
//
// URL changes are identified by the whole query string, not only by the
// search text: going Back from `?search=e&page=2` to `?search=e` leaves the
// search unchanged but is still a navigation the draft must yield to.

export interface SearchSyncState {
  // Text in the input.
  draft: string;
  // The query string (URLSearchParams.toString()) this state was last
  // reconciled with.
  syncedQuery: string;
  // The query string SearchBar itself last navigated to, until the URL shows
  // it. Cleared on the next URL change either way, so it can't go stale.
  pendingQuery: string | null;
}

export function initialSearchSync(
  query: string,
  urlSearch: string
): SearchSyncState {
  return { draft: urlSearch, syncedQuery: query, pendingQuery: null };
}

// Called on every render with the current URL.
// - Same query string as last time: nothing happened; keep the state.
// - SearchBar's own navigation arriving (query === pendingQuery): keep the
//   draft, so anything typed while it was in flight is not lost.
// - Any other navigation (Back/Forward, "All Blogs" reset, pagination,
//   category change, a link): the URL wins and replaces the draft, so a
//   superseded draft can never be committed. A category change that wants to
//   keep the typed text carries it in its own URL (see CategoriesList).
// Returns the same object when nothing changed.
export function reconcileWithUrl(
  state: SearchSyncState,
  query: string,
  urlSearch: string
): SearchSyncState {
  if (query === state.syncedQuery) {
    return state;
  }
  const isOwnNavigation = query === state.pendingQuery;
  return {
    draft: isOwnNavigation ? state.draft : urlSearch,
    syncedQuery: query,
    pendingQuery: null,
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
