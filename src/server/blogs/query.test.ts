import { describe, expect, it } from 'vitest';
import { queryBlogs } from '@/server/blogs/query';
import type { StoredBlog } from '@/lib/blogs/types';

function blog(slug: string, date: string, extra: Partial<StoredBlog> = {}) {
  return {
    slug,
    title: `title ${slug}`,
    content: `content ${slug}`,
    category: 'general',
    date: new Date(date),
    ...extra,
  };
}

// Insertion order deliberately differs from date order, with a date tie.
const FIXTURE: StoredBlog[] = [
  blog('b-middle', '2026-02-01'),
  blog('e-oldest', '2026-01-01', { category: 'css' }),
  blog('a-newest', '2026-04-01', { title: 'Grid Layout' }),
  blog('d-tie', '2026-03-01', { category: 'css' }),
  blog('c-tie', '2026-03-01'),
];

const slugs = (result: ReturnType<typeof queryBlogs>) =>
  result.data.map((item) => item.slug);

describe('queryBlogs', () => {
  it('sorts newest first across pages, breaking date ties by slug', () => {
    const page1 = queryBlogs(FIXTURE, { page: 1, limit: 2 });
    const page2 = queryBlogs(FIXTURE, { page: 2, limit: 2 });
    const page3 = queryBlogs(FIXTURE, { page: 3, limit: 2 });
    expect(slugs(page1)).toEqual(['a-newest', 'c-tie']);
    expect(slugs(page2)).toEqual(['d-tie', 'b-middle']);
    expect(slugs(page3)).toEqual(['e-oldest']);
    expect(page1.meta).toEqual({
      total: 5,
      page: 1,
      limit: 2,
      hasNextPage: true,
    });
    expect(page3.meta.hasNextPage).toBe(false);
  });

  it('does not mutate the source array', () => {
    const before = FIXTURE.map((item) => item.slug);
    queryBlogs(FIXTURE, { page: 1, limit: 10 });
    expect(FIXTURE.map((item) => item.slug)).toEqual(before);
  });

  it('filters before paginating, so metadata describes the filtered set', () => {
    const result = queryBlogs(FIXTURE, { page: 1, limit: 1, category: 'css' });
    expect(slugs(result)).toEqual(['d-tie']);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 1,
      hasNextPage: true,
    });
  });

  it('searches title and content case-insensitively', () => {
    expect(
      slugs(queryBlogs(FIXTURE, { page: 1, limit: 10, search: ' grid ' }))
    ).toEqual(['a-newest']);
    expect(
      slugs(
        queryBlogs(FIXTURE, { page: 1, limit: 10, search: 'CONTENT E-OLD' })
      )
    ).toEqual(['e-oldest']);
  });

  it('adds an encoded placeholder image', () => {
    const [first] = queryBlogs(FIXTURE, { page: 1, limit: 1 }).data;
    expect(first.image).toBe('https://placehold.co/600x400.png?text=a-newest');
  });

  it('returns an empty, coherent page past the end', () => {
    expect(queryBlogs(FIXTURE, { page: 4, limit: 2 })).toEqual({
      data: [],
      meta: { total: 5, page: 4, limit: 2, hasNextPage: false },
    });
  });

  it('handles the largest safe page without an unsafe offset', () => {
    const result = queryBlogs(FIXTURE, {
      page: Number.MAX_SAFE_INTEGER,
      limit: 100,
    });
    expect(result.data).toEqual([]);
    expect(result.meta.page).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.meta.hasNextPage).toBe(false);
  });

  it('returns coherent metadata when nothing matches', () => {
    expect(
      queryBlogs(FIXTURE, { page: 1, limit: 10, search: 'nothing' })
    ).toEqual({
      data: [],
      meta: { total: 0, page: 1, limit: 10, hasNextPage: false },
    });
  });
});
