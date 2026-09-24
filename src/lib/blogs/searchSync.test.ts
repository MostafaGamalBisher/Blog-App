import { describe, expect, it } from 'vitest';
import {
  initialSearchSync,
  reconcileWithUrl,
  searchHistoryMode,
  type SearchSyncState,
} from '@/lib/blogs/searchSync';

describe('reconcileWithUrl', () => {
  it('returns the same state object when the URL has not changed', () => {
    const state = initialSearchSync('gen');
    expect(reconcileWithUrl(state, 'gen')).toBe(state);
  });

  it('keeps the draft when our own navigation arrives', () => {
    // Typed "generics" while the navigation to "gen" was in flight.
    const state: SearchSyncState = {
      draft: 'generics',
      syncedSearch: '',
      pendingSearch: 'gen',
    };
    expect(reconcileWithUrl(state, 'gen')).toEqual({
      draft: 'generics',
      syncedSearch: 'gen',
      pendingSearch: null,
    });
  });

  it('replaces a stale draft after an external reset ("All Blogs")', () => {
    const state: SearchSyncState = {
      draft: 'zzz',
      syncedSearch: 'zzz',
      pendingSearch: null,
    };
    expect(reconcileWithUrl(state, '')).toEqual(initialSearchSync(''));
  });

  it('follows Back to an earlier search', () => {
    const state = initialSearchSync('generics');
    expect(reconcileWithUrl(state, 'gen').draft).toBe('gen');
  });

  it('discards pending typing when navigation supersedes it', () => {
    // Typed "abc" (not yet committed), then pressed Back.
    const state: SearchSyncState = {
      draft: 'abc',
      syncedSearch: 'gen',
      pendingSearch: null,
    };
    expect(reconcileWithUrl(state, '').draft).toBe('');
  });

  it('treats Forward to a previously pushed value as external', () => {
    // Pushed "gen" (echo consumed), went Back to "", then Forward to "gen".
    let state = reconcileWithUrl(
      { draft: 'gen', syncedSearch: '', pendingSearch: 'gen' },
      'gen'
    );
    state = reconcileWithUrl(state, '');
    expect(state.draft).toBe('');
    state = reconcileWithUrl(state, 'gen');
    expect(state.draft).toBe('gen');
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
