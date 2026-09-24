import { describe, expect, it } from 'vitest';
import { getBlogBySlug, listBlogs, listCategories } from '@/server/blogs/data';

describe('getBlogBySlug', () => {
  it('returns a stored blog with its derived image', async () => {
    const blog = await getBlogBySlug('first-blog');
    expect(blog).toMatchObject({
      slug: 'first-blog',
      title: 'typescript mastery',
      image: 'https://placehold.co/600x400.png?text=first-blog',
    });
    expect(blog?.date).toBeInstanceOf(Date);
  });

  it.each([
    'toString',
    'constructor',
    '__proto__',
    'hasOwnProperty',
    'valueOf',
    'does-not-exist',
  ])('returns null for %j', async (slug) => {
    expect(await getBlogBySlug(slug)).toBeNull();
  });
});

describe('listBlogs', () => {
  it('lists the real data newest first', async () => {
    const { data, meta } = await listBlogs({ page: 1, limit: 10 });
    expect(data[0].slug).toBe('fourteenth-blog');
    expect(meta).toEqual({ total: 14, page: 1, limit: 10, hasNextPage: true });

    const page2 = await listBlogs({ page: 2, limit: 10 });
    expect(page2.data.map((blog) => blog.slug)).toEqual([
      'fourth-blog',
      'third-blog',
      'second-blog',
      'first-blog',
    ]);
  });
});

describe('listCategories', () => {
  it('returns each category once', async () => {
    expect(await listCategories()).toEqual([
      'typescript',
      'nextjs',
      'css',
      'javascript',
    ]);
  });
});
