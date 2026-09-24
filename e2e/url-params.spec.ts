import { expect, test, type Page } from '@playwright/test';
import { cardTitles, searchInput, urlParams, waitForList } from './helpers';

// Records every GET /api/blogs request the page makes.
function recordApiRequests(page: Page) {
  const requests: URLSearchParams[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/api/blogs') {
      requests.push(url.searchParams);
    }
  });
  return requests;
}

test.describe('invalid /blog URLs show a clear error with a way back', () => {
  for (const [query, message] of [
    ['search=css&search=nextjs', 'search must not be repeated'],
    ['search=css&search=css', 'search must not be repeated'],
    ['category=css&category=nextjs', 'category must not be repeated'],
    ['category=css&category=css', 'category must not be repeated'],
    ['page=1&page=2', 'page must not be repeated'],
    ['page=2&page=2', 'page must not be repeated'],
    ['page=abc', 'page must be a positive integer'],
    ['page=0', 'page must be a positive integer'],
  ]) {
    test(`/blog?${query}`, async ({ page }) => {
      const apiRequests = recordApiRequests(page);

      await page.goto(`/blog?${query}`);

      await expect(
        page.getByRole('heading', { name: 'This link has invalid filters' })
      ).toBeVisible();
      await expect(page.getByText(`${message}.`)).toBeVisible();
      // Nothing is rendered or requested with the invalid values.
      await expect(searchInput(page)).toHaveCount(0);
      expect(apiRequests).toHaveLength(0);

      await page.getByRole('link', { name: 'Show all blogs' }).click();
      await page.waitForURL('/blog');
      await waitForList(page);
      await expect(cardTitles(page)).toHaveCount(10);
      await expect(searchInput(page)).toHaveValue('');
    });
  }
});

test.describe('valid /blog URLs', () => {
  for (const [query, input, apiSearch, cards] of [
    ['', '', null, 10],
    ['search=', '', null, 10],
    ['category=', '', null, 10],
    ['page=2', '', null, 4],
    ['search=a%2Cb', 'a,b', 'a,b', 0],
    ['search=a,b', 'a,b', 'a,b', 0],
    ['search=C%2B%2B', 'C++', 'C++', 0],
    [
      'search=css%26category%3Dnextjs',
      'css&category=nextjs',
      'css&category=nextjs',
      0,
    ],
    ['search=css%23layout', 'css#layout', 'css#layout', 0],
    ['search=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7', 'مرحبا', 'مرحبا', 0],
    ['search=grid', 'grid', 'grid', 1],
  ] as const) {
    test(`/blog?${query}`, async ({ page }) => {
      const apiRequests = recordApiRequests(page);

      await page.goto(`/blog?${query}`);
      await waitForList(page);

      await expect(searchInput(page)).toHaveValue(input);
      await expect(cardTitles(page)).toHaveCount(cards);
      expect(apiRequests).toHaveLength(1);
      const [api] = apiRequests;
      expect(api.getAll('search')).toEqual(
        apiSearch === null ? [] : [apiSearch]
      );
      expect(api.has('category')).toBe(false);
      // The page never rewrites a valid URL on its own.
      await page.waitForTimeout(800);
      expect(new URL(page.url()).search).toBe(query ? `?${query}` : '');
    });
  }

  test('a single category reaches the API as one value', async ({ page }) => {
    const apiRequests = recordApiRequests(page);
    await page.goto('/blog?category=css');
    await waitForList(page);
    expect(apiRequests.map((params) => params.getAll('category'))).toEqual([
      ['css'],
    ]);
    expect(urlParams(page)).toEqual([['category', 'css']]);
  });
});

test.describe('API still rejects repeated parameters', () => {
  for (const query of [
    'search=css&search=nextjs',
    'category=css&category=css',
    'page=1&page=2',
  ]) {
    test(`GET /api/blogs?${query} -> 400`, async ({ request }) => {
      const response = await request.get(`/api/blogs?${query}`);
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({
        error: `${query.split('=')[0]} must not be repeated`,
      });
    });
  }
});

test.describe('retries', () => {
  test('a 400 from the API is shown at once, without retrying', async ({
    page,
  }) => {
    let calls = 0;
    await page.route('**/api/blogs?*', (route) => {
      calls += 1;
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'simulated validation error' }),
      });
    });

    const started = Date.now();
    await page.goto('/blog');
    await expect(page.getByText("Couldn't load blogs.")).toBeVisible();
    const elapsed = Date.now() - started;

    await page.waitForTimeout(2500); // longer than the first retry delay
    expect(calls).toBe(1);
    expect(elapsed).toBeLessThan(2500);
  });

  test('a temporary failure is retried and recovers on its own', async ({
    page,
  }) => {
    let calls = 0;
    await page.route('**/api/blogs?*', (route) => {
      calls += 1;
      return calls <= 2
        ? route.fulfill({ status: 503, body: 'unavailable' })
        : route.continue();
    });

    await page.goto('/blog');
    await expect(cardTitles(page)).toHaveCount(10, { timeout: 10_000 });
    expect(calls).toBe(3);
  });

  test('after retries run out, "Try again" recovers', async ({ page }) => {
    let failing = true;
    await page.route('**/api/blogs?*', (route) =>
      failing ? route.fulfill({ status: 500, body: 'boom' }) : route.continue()
    );

    await page.goto('/blog');
    await expect(page.getByText("Couldn't load blogs.")).toBeVisible({
      timeout: 15_000,
    });
    failing = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(cardTitles(page)).toHaveCount(10);
  });
});
