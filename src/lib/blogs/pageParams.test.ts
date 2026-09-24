import { describe, expect, it } from 'vitest';
import { parseBlogPageParams } from '@/lib/blogs/pageParams';

describe('parseBlogPageParams', () => {
  it('uses page 1 and no filters when parameters are absent', () => {
    expect(parseBlogPageParams({})).toEqual({
      ok: true,
      value: { search: undefined, category: undefined, page: 1 },
    });
  });

  it('treats empty search and category as no filter', () => {
    expect(parseBlogPageParams({ search: '', category: '' })).toEqual({
      ok: true,
      value: { search: undefined, category: undefined, page: 1 },
    });
  });

  it('accepts single values', () => {
    expect(
      parseBlogPageParams({ search: 'grid', category: 'css', page: '2' })
    ).toEqual({
      ok: true,
      value: { search: 'grid', category: 'css', page: 2 },
    });
  });

  it.each(['a,b', 'C++', 'css&category=nextjs', 'css#layout', 'مرحبا'])(
    'keeps the literal single value %j',
    (search) => {
      expect(parseBlogPageParams({ search })).toMatchObject({
        ok: true,
        value: { search },
      });
    }
  );

  it.each([
    [{ search: ['css', 'nextjs'] }, 'search must not be repeated'],
    [{ search: ['css', 'css'] }, 'search must not be repeated'],
    [{ category: ['css', 'nextjs'] }, 'category must not be repeated'],
    [{ category: ['css', 'css'] }, 'category must not be repeated'],
    [{ page: ['1', '2'] }, 'page must not be repeated'],
    [{ page: ['2', '2'] }, 'page must not be repeated'],
    [{ page: 'abc' }, 'page must be a positive integer'],
    [{ page: '0' }, 'page must be a positive integer'],
    [{ page: '' }, 'page must be a positive integer'],
    [{ page: '9007199254740993' }, 'page is too large'],
  ])('rejects %j', (params, error) => {
    expect(parseBlogPageParams(params)).toEqual({ ok: false, error });
  });

  it('never returns an array value', () => {
    const result = parseBlogPageParams({ search: ['a', 'b'] });
    expect(result.ok).toBe(false);
  });

  it('ignores unrelated parameters', () => {
    expect(
      parseBlogPageParams({ utm_source: ['a', 'b'], search: 'x' })
    ).toMatchObject({ ok: true, value: { search: 'x' } });
  });
});
