import { describe, expect, it } from 'vitest';
import {
  blogListHref,
  blogsApiPath,
  updateBlogListHref,
} from '@/lib/blogs/urls';

// Parses the query string of a relative href back into decoded values.
function paramsOf(href: string): URLSearchParams {
  return new URL(href, 'http://localhost').searchParams;
}

const LITERAL_SEARCHES = [
  'C++',
  'css&category=nextjs',
  'css#layout',
  'flexbox and grid',
  'مرحبا بالعالم',
  '100% match?',
];

describe('blogListHref', () => {
  it('returns the bare list path when there are no filters', () => {
    expect(blogListHref({})).toBe('/blog');
  });

  it('leaves page 1 out and includes later pages', () => {
    expect(blogListHref({ page: 1 })).toBe('/blog');
    expect(paramsOf(blogListHref({ page: 2 })).get('page')).toBe('2');
  });

  it.each(LITERAL_SEARCHES)('keeps search %j literal', (search) => {
    const params = paramsOf(
      blogListHref({ search, category: 'nextjs', page: 2 })
    );
    expect(params.get('search')).toBe(search);
    expect(params.getAll('category')).toEqual(['nextjs']);
    expect(params.get('page')).toBe('2');
  });

  it('does not let a search containing &category= add a category', () => {
    const params = paramsOf(blogListHref({ search: 'css&category=nextjs' }));
    expect(params.has('category')).toBe(false);
    expect([...params.keys()]).toEqual(['search']);
  });

  it('does not double-encode', () => {
    const href = blogListHref({ search: 'C++' });
    expect(href).toBe('/blog?search=C%2B%2B');
  });
});

describe('blogsApiPath', () => {
  it.each(LITERAL_SEARCHES)('sends search %j literally', (search) => {
    const params = paramsOf(blogsApiPath({ search, page: 3 }));
    expect(params.get('search')).toBe(search);
    expect(params.get('page')).toBe('3');
    expect(params.get('limit')).toBe('10');
    expect(params.has('category')).toBe(false);
  });

  it('defaults page to 1 and passes the category', () => {
    const params = paramsOf(blogsApiPath({ category: 'css' }));
    expect(params.get('page')).toBe('1');
    expect(params.get('category')).toBe('css');
  });
});

describe('updateBlogListHref', () => {
  const current = new URLSearchParams({
    category: 'nextjs',
    search: 'C++',
    page: '3',
  });

  it('changing the category keeps the search and resets the page', () => {
    const params = paramsOf(updateBlogListHref(current, { category: 'css' }));
    expect(params.get('category')).toBe('css');
    expect(params.get('search')).toBe('C++');
    expect(params.has('page')).toBe(false);
  });

  it('"all categories" (null) removes only the category', () => {
    const href = updateBlogListHref(current, { category: null });
    expect(href).toBe('/blog?search=C%2B%2B');
  });

  it('changing the search keeps the category and resets the page', () => {
    const params = paramsOf(
      updateBlogListHref(current, { search: 'css#layout' })
    );
    expect(params.get('search')).toBe('css#layout');
    expect(params.get('category')).toBe('nextjs');
    expect(params.has('page')).toBe(false);
  });

  it('clearing the search removes it', () => {
    expect(updateBlogListHref(current, { search: '' })).toBe(
      '/blog?category=nextjs'
    );
  });

  it('keeps unrelated parameters', () => {
    const withExtra = new URLSearchParams('search=a&utm_source=mail');
    const params = paramsOf(updateBlogListHref(withExtra, { category: 'css' }));
    expect(params.get('utm_source')).toBe('mail');
  });
});
