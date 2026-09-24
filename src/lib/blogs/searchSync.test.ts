import { describe, expect, it } from 'vitest';
import {
  initialSearchSync,
  reconcileWithUrl,
  searchHistoryMode,
  type SearchSyncState,
} from '@/lib/blogs/searchSync';

describe('reconcileWithUrl', () => {
  it('returns the same state object when the URL has not changed', () => {
    const state = initialSearchSync('search=gen', 'gen');
    expect(reconcileWithUrl(state, 'search=gen', 'gen')).toBe(state);
  });

  it('keeps pending typing while the URL is unchanged', () => {
    const state: SearchSyncState = {
      draft: 'generics',
      syncedQuery: 'search=gen',
      pendingQuery: null,
    };
    expect(reconcileWithUrl(state, 'search=gen', 'gen')).toBe(state);
  });

  it('keeps the draft when its own navigation arrives', () => {
    // Typed "generics" while the navigation to "gen" was in flight.
    const state: SearchSyncState = {
      draft: 'generics',
      syncedQuery: '',
      pendingQuery: 'search=gen',
    };
    expect(reconcileWithUrl(state, 'search=gen', 'gen')).toEqual({
      draft: 'generics',
      syncedQuery: 'search=gen',
      pendingQuery: null,
    });
  });

  // The reviewed finding: Back from ?search=e&page=2 to ?search=e keeps the
  // search text the same, so comparing only the search let the pending
  // "generics" survive and be committed.
  it('discards pending typing on Back to an entry with the same search', () => {
    const state: SearchSyncState = {
      draft: 'generics',
      syncedQuery: 'search=e&page=2',
      pendingQuery: null,
    };
    expect(reconcileWithUrl(state, 'search=e', 'e')).toEqual({
      draft: 'e',
      syncedQuery: 'search=e',
      pendingQuery: null,
    });
  });

  it('discards pending typing when only the category changes', () => {
    const state: SearchSyncState = {
      draft: 'grid',
      syncedQuery: 'search=e&category=css',
      pendingQuery: null,
    };
    expect(reconcileWithUrl(state, 'search=e', 'e').draft).toBe('e');
  });

  it('discards pending typing on reset when the committed search was empty', () => {
    const state: SearchSyncState = {
      draft: 'abc',
      syncedQuery: 'category=nope',
      pendingQuery: null,
    };
    expect(reconcileWithUrl(state, '', '').draft).toBe('');
  });

  it('follows Back to an earlier search', () => {
    const state = initialSearchSync('search=generics', 'generics');
    expect(reconcileWithUrl(state, 'search=gen', 'gen').draft).toBe('gen');
  });

  it('treats Forward to a previously pushed URL as external', () => {
    // Pushed ?search=gen (arrival consumed), went Back, then Forward.
    let state = reconcileWithUrl(
      { draft: 'gen', syncedQuery: '', pendingQuery: 'search=gen' },
      'search=gen',
      'gen'
    );
    state = reconcileWithUrl(state, '', '');
    expect(state.draft).toBe('');
    state = { ...state, draft: 'zzz' }; // pending typing before Forward
    state = reconcileWithUrl(state, 'search=gen', 'gen');
    expect(state.draft).toBe('gen');
  });

  it('does not treat a stale pending URL as its own after another change', () => {
    // SearchBar navigated to ?search=a, but Back arrived first.
    let state: SearchSyncState = {
      draft: 'a',
      syncedQuery: 'search=x',
      pendingQuery: 'search=a',
    };
    state = reconcileWithUrl(state, '', '');
    expect(state).toEqual({ draft: '', syncedQuery: '', pendingQuery: null });
    // A later arrival at ?search=a is no longer SearchBar's own navigation.
    state = { ...state, draft: 'typed' };
    expect(reconcileWithUrl(state, 'search=a', 'a').draft).toBe('a');
  });
});

describe('searchHistoryMode', () => {
  it('pushes when a search starts or is cleared', () => {
    expect(searchHistoryMode('', 'gen')).toBe('push');
    expect(searchHistoryMode('gen', '')).toBe('push');
  });

  it('replaces while an existing search is refined', () => {
    expect(searchHistoryMode('gen', 'generics')).toBe('replace');
  });
});
