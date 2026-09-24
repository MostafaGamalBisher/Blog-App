import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchData, shouldRetryQuery } from '@/app/blog/utils/fetchData';
import { getBlogsFn } from '@/app/blog/utils/getBlogsFn';
import { getCategoriesFn } from '@/app/blog/utils/getCategoriesFn';

function mockFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchData failure classification', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(async () => jsonResponse({ data: [] }));
    expect(await fetchData('/api/x')).toEqual({
      ok: true,
      data: { data: [] },
    });
  });

  it('classifies a rejected fetch as a network failure', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await fetchData('/api/x')).toEqual({
      ok: false,
      error: { kind: 'network', message: 'Failed to fetch' },
    });
  });

  it('classifies a non-2xx status as http and keeps the API message', async () => {
    mockFetch(async () =>
      jsonResponse({ error: 'page must be a positive integer' }, 400)
    );
    expect(await fetchData('/api/x')).toEqual({
      ok: false,
      error: {
        kind: 'http',
        status: 400,
        message: 'page must be a positive integer',
      },
    });
  });

  it('falls back to the status when an error body is not JSON', async () => {
    mockFetch(
      async () =>
        new Response('<html>oops</html>', {
          status: 500,
          statusText: 'Internal Server Error',
        })
    );
    expect(await fetchData('/api/x')).toEqual({
      ok: false,
      error: { kind: 'http', status: 500, message: 'Internal Server Error' },
    });
  });

  it('classifies an invalid JSON body as a parse failure', async () => {
    mockFetch(async () => new Response('not json', { status: 200 }));
    const result = await fetchData('/api/x');
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.kind).toBe('parse');
  });
});

describe('getBlogsFn', () => {
  const rawBlog = {
    title: 't',
    slug: 's',
    date: '2026-01-14T00:00:00.000Z',
    content: 'c',
    category: 'css',
    image: 'https://placehold.co/600x400.png?text=s',
  };
  const meta = { total: 1, page: 1, limit: 10, hasNextPage: false };

  it('requests an encoded URL and converts dates', async () => {
    const fetchMock = mockFetch(async () =>
      jsonResponse({ data: [rawBlog], meta })
    );
    const result = await getBlogsFn({ search: 'C++', category: 'css' });
    const url = new URL(String(fetchMock.mock.calls[0]), 'http://localhost');
    expect(url.pathname).toBe('/api/blogs');
    expect(url.searchParams.get('search')).toBe('C++');
    expect(url.searchParams.get('category')).toBe('css');
    expect(result.data[0].date).toBeInstanceOf(Date);
    expect(result.meta).toEqual(meta);
  });

  it('keeps the fetch failure as the error cause', async () => {
    mockFetch(async () => jsonResponse({ error: 'boom' }, 500));
    const error = await getBlogsFn({}).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('http 500: boom');
    expect((error as Error).cause).toEqual({
      kind: 'http',
      status: 500,
      message: 'boom',
    });
  });

  it.each([
    ['missing meta', { data: [rawBlog] }],
    ['invalid date', { data: [{ ...rawBlog, date: 'nope' }], meta }],
    ['missing field', { data: [{ ...rawBlog, title: undefined }], meta }],
    ['non-object', ['not', 'an', 'object']],
  ])('rejects a response with %s', async (_label, body) => {
    mockFetch(async () => jsonResponse(body));
    await expect(getBlogsFn({})).rejects.toThrow('unexpected response shape');
  });
});

describe('getCategoriesFn', () => {
  it('returns the categories', async () => {
    mockFetch(async () => jsonResponse({ data: ['css', 'nextjs'] }));
    expect(await getCategoriesFn()).toEqual(['css', 'nextjs']);
  });

  it('keeps failure details instead of an empty error', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    const error = await getCategoriesFn().catch((caught: unknown) => caught);
    expect((error as Error).message).toBe(
      'Failed to load categories (network: Failed to fetch)'
    );
    expect((error as Error).cause).toEqual({
      kind: 'network',
      message: 'Failed to fetch',
    });
  });

  it('rejects a response that is not a string list', async () => {
    mockFetch(async () => jsonResponse({ data: [1, 2] }));
    await expect(getCategoriesFn()).rejects.toThrow(
      'unexpected response shape'
    );
  });
});

describe('shouldRetryQuery', () => {
  const withCause = (cause: unknown) => new Error('failed', { cause });

  it('does not retry a 400 validation error', () => {
    const error = withCause({ kind: 'http', status: 400, message: 'bad' });
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it.each([
    ['network', { kind: 'network', message: 'offline' }],
    ['500', { kind: 'http', status: 500, message: 'boom' }],
    ['408 timeout', { kind: 'http', status: 408, message: 'timeout' }],
    ['429 rate limit', { kind: 'http', status: 429, message: 'slow down' }],
    ['parse', { kind: 'parse', status: 200, message: 'bad json' }],
    ['no cause', undefined],
  ])('retries %s up to 3 times', (_label, cause) => {
    const error = withCause(cause);
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(true);
    expect(shouldRetryQuery(3, error)).toBe(false);
  });

  it('reads the structured cause, not the message text', () => {
    const error = new Error('http 400: looks like a validation error', {
      cause: { kind: 'http', status: 503, message: 'unavailable' },
    });
    expect(shouldRetryQuery(0, error)).toBe(true);
  });
});
