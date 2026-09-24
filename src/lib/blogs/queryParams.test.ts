import { describe, expect, it } from 'vitest';
import { optionalFilter, positiveInteger } from '@/lib/blogs/queryParams';

describe('optionalFilter', () => {
  it('treats no value and an empty value as no filter', () => {
    expect(optionalFilter('search', [])).toEqual({
      ok: true,
      value: undefined,
    });
    expect(optionalFilter('search', [''])).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it('rejects repeated values, even identical ones', () => {
    expect(optionalFilter('search', ['a', 'a'])).toEqual({
      ok: false,
      error: 'search must not be repeated',
    });
  });

  it('keeps a literal comma as one value', () => {
    expect(optionalFilter('search', ['a,b'])).toEqual({
      ok: true,
      value: 'a,b',
    });
  });
});

describe('positiveInteger', () => {
  it('uses the fallback only when absent', () => {
    expect(positiveInteger('page', [], 1)).toEqual({ ok: true, value: 1 });
    expect(positiveInteger('page', [''], 1)).toEqual({
      ok: false,
      error: 'page must be a positive integer',
    });
  });
});
