import { describe, expect, it } from 'vitest';
import { GET as getBlogs } from '@/app/api/blogs/route';
import { GET as getBlog } from '@/app/api/blogs/[slug]/route';
import { GET as getCategories } from '@/app/api/categories/route';

// These call the real route handlers with real Request objects and check the
// HTTP status and JSON body they produce.

async function list(query: string) {
  const response = await getBlogs(
    new Request(`http://localhost/api/blogs?${query}`)
  );
  return { status: response.status, body: await response.json() };
}

async function detail(slug: string) {
  const response = await getBlog(
    new Request(`http://localhost/api/blogs/${slug}`),
    { params: Promise.resolve({ slug }) }
  );
  return { status: response.status, body: await response.json() };
}

describe('GET /api/blogs', () => {
  it('uses the documented defaults (page 1, limit 1)', async () => {
    const { status, body } = await list('');
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].slug).toBe('fourteenth-blog');
    expect(body.meta).toEqual({
      total: 14,
      page: 1,
      limit: 1,
      hasNextPage: true,
    });
  });

  it('serializes dates as ISO strings', async () => {
    const { body } = await list('page=1&limit=1');
    expect(body.data[0].date).toBe('2026-01-14T00:00:00.000Z');
  });

  it.each([
    'page=abc',
    'page=0',
    'page=-1',
    'page=1.5',
    'page=',
    'limit=0',
    'limit=-1',
    'limit=101',
    'limit=9007199254740993',
    'page=9007199254740993',
    'page=1&page=2',
  ])('rejects %s with 400 and an error body', async (query) => {
    const { status, body } = await list(query);
    expect(status).toBe(400);
    expect(Object.keys(body)).toEqual(['error']);
    expect(typeof body.error).toBe('string');
  });

  it('returns an empty page with coherent metadata past the end', async () => {
    const { status, body } = await list('page=99&limit=10');
    expect(status).toBe(200);
    expect(body).toEqual({
      data: [],
      meta: { total: 14, page: 99, limit: 10, hasNextPage: false },
    });
  });

  it('keeps an encoded search literal', async () => {
    const { body } = await list(
      `limit=10&search=${encodeURIComponent('css&category=nextjs')}`
    );
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });
});

describe('GET /api/blogs/[slug]', () => {
  it('returns a blog', async () => {
    const { status, body } = await detail('second-blog');
    expect(status).toBe(200);
    expect(body.slug).toBe('second-blog');
  });

  it.each(['toString', 'constructor', '__proto__', 'missing'])(
    'returns 404 for %j',
    async (slug) => {
      const { status, body } = await detail(slug);
      expect(status).toBe(404);
      expect(body).toEqual({ error: 'Blog not found' });
    }
  );
});

describe('GET /api/categories', () => {
  it('returns the category list', async () => {
    const response = await getCategories();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: ['typescript', 'nextjs', 'css', 'javascript'],
    });
  });
});
