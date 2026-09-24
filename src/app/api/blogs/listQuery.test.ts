import { describe, expect, it } from 'vitest';
import { MAX_LIMIT, parseBlogListQuery } from '@/app/api/blogs/listQuery';

function parse(query: string) {
  return parseBlogListQuery(new URLSearchParams(query));
}

describe('parseBlogListQuery', () => {
  it('uses the documented defaults when page and limit are absent', () => {
    expect(parse('')).toEqual({
      ok: true,
      value: { page: 1, limit: 1, category: undefined, search: undefined },
    });
  });

  it('accepts valid values', () => {
    expect(parse('page=2&limit=10&category=css&search=%20grid%20')).toEqual({
      ok: true,
      value: { page: 2, limit: 10, category: 'css', search: 'grid' },
    });
  });

  it(`accepts limit=${MAX_LIMIT}`, () => {
    expect(parse(`limit=${MAX_LIMIT}`).ok).toBe(true);
  });

  it.each([
    ['page=abc', 'page must be a positive integer'],
    ['page=0', 'page must be a positive integer'],
    ['page=-1', 'page must be a positive integer'],
    ['page=1.5', 'page must be a positive integer'],
    ['page=1e3', 'page must be a positive integer'],
    ['page=01', 'page must be a positive integer'],
    ['page=%201', 'page must be a positive integer'],
    ['page=', 'page must be a positive integer'],
    ['page=9007199254740993', 'page is too large'],
    ['page=1&page=2', 'page must not be repeated'],
    ['limit=0', 'limit must be a positive integer'],
    ['limit=-1', 'limit must be a positive integer'],
    ['limit=', 'limit must be a positive integer'],
    [`limit=${MAX_LIMIT + 1}`, `limit must not be greater than ${MAX_LIMIT}`],
    ['limit=100000', `limit must not be greater than ${MAX_LIMIT}`],
    ['limit=9007199254740993', 'limit is too large'],
    ['category=a&category=b', 'category must not be repeated'],
    ['search=a&search=b', 'search must not be repeated'],
  ])('rejects %s', (query, error) => {
    expect(parse(query)).toEqual({ ok: false, error });
  });

  it('treats empty category and blank search as no filter', () => {
    expect(parse('category=&search=%20%20')).toEqual({
      ok: true,
      value: { page: 1, limit: 1, category: undefined, search: undefined },
    });
  });

  it('accepts the largest safe integer page', () => {
    expect(parse('page=9007199254740991')).toMatchObject({
      ok: true,
      value: { page: Number.MAX_SAFE_INTEGER },
    });
  });
});
