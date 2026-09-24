import { expect, test } from '@playwright/test';
import {
  activeCategory,
  cardTitles,
  chooseCategory,
  expectSettled,
  searchInput,
  slowDownNavigations,
  waitForList,
} from './helpers';

// In these tests `fill` types text without waiting, so the 300 ms debounce
// is still pending when the next action (Back, Forward, a click) happens.

test.describe('pending typing is discarded when navigation supersedes it', () => {
  test('Back to an entry with the same search but another page', async ({
    page,
  }) => {
    await page.goto('/blog?search=e');
    await waitForList(page);
    await page.locator('a[href="/blog?search=e&page=2"]').click();
    await page.waitForURL('/blog?search=e&page=2');
    await waitForList(page);

    await searchInput(page).fill('generics');
    await page.goBack();

    await expectSettled(page, [['search', 'e']], 'e');

    await page.goForward();
    await expectSettled(
      page,
      [
        ['search', 'e'],
        ['page', '2'],
      ],
      'e'
    );
  });

  test('Back to an entry with the same search but another category', async ({
    page,
  }) => {
    await page.goto('/blog?search=e');
    await waitForList(page);
    await chooseCategory(page, 'css');
    await page.waitForURL('/blog?search=e&category=css');
    await waitForList(page);

    await searchInput(page).fill('grid');
    await page.goBack();

    await expectSettled(page, [['search', 'e']], 'e');
    expect(await activeCategory(page)).toBe('all categories');
  });

  test('Forward to an entry with the same search', async ({ page }) => {
    await page.goto('/blog?search=e');
    await waitForList(page);
    await page.locator('a[href="/blog?search=e&page=2"]').click();
    await page.waitForURL('/blog?search=e&page=2');
    await page.goBack();
    await page.waitForURL('/blog?search=e');
    await waitForList(page);

    await searchInput(page).fill('zzz');
    await page.goForward();

    await expectSettled(
      page,
      [
        ['search', 'e'],
        ['page', '2'],
      ],
      'e'
    );
  });

  test('Back on a slow network', async ({ page }) => {
    await page.goto('/blog?search=e');
    await waitForList(page);
    await page.locator('a[href="/blog?search=e&page=2"]').click();
    await page.waitForURL('/blog?search=e&page=2');
    await waitForList(page);
    await slowDownNavigations(page, 800);

    await searchInput(page).fill('generics');
    await page.goBack();

    await expectSettled(page, [['search', 'e']], 'e');
  });

  test('reset ("All Blogs") when the committed search was empty', async ({
    page,
  }) => {
    await page.goto('/blog?category=no-such-category');
    await expect(page.getByText('No Blogs to render')).toBeVisible();

    await searchInput(page).fill('abc');
    await page.getByText('All Blogs', { exact: true }).click();

    await expectSettled(page, [], '');
    await expect(cardTitles(page)).toHaveCount(10);
  });

  test('reset ("All Blogs") when a search was committed', async ({ page }) => {
    await page.goto('/blog?category=css&search=zzz');
    await expect(page.getByText('No Blogs to render')).toBeVisible();

    await searchInput(page).fill('abc');
    await page.getByText('All Blogs', { exact: true }).click();

    await expectSettled(page, [], '');
  });
});

test.describe('pending typing on a slow network', () => {
  test('reset ("All Blogs") still wins', async ({ page }) => {
    await page.goto('/blog?category=no-such-category');
    await expect(page.getByText('No Blogs to render')).toBeVisible();
    await slowDownNavigations(page, 800);

    await searchInput(page).fill('abc');
    await page.getByText('All Blogs', { exact: true }).click();

    await expectSettled(page, [], '');
  });

  test('a pagination link still wins', async ({ page }) => {
    await page.goto('/blog?search=e');
    await waitForList(page);
    await slowDownNavigations(page, 800);

    await searchInput(page).fill('generics');
    await page.locator('a[href="/blog?search=e&page=2"]').click();

    await expectSettled(
      page,
      [
        ['search', 'e'],
        ['page', '2'],
      ],
      'e'
    );
  });
});

test.describe('typing that should be kept', () => {
  test('rapid typing commits the final text in one history entry', async ({
    page,
  }) => {
    await page.goto('/blog');
    await waitForList(page);
    const historyBefore = await page.evaluate(() => history.length);

    await searchInput(page).pressSequentially('generics', { delay: 30 });

    await expectSettled(page, [['search', 'generics']], 'generics');
    const historyAfter = await page.evaluate(() => history.length);
    expect(historyAfter - historyBefore).toBe(1);
  });

  test('typing during an in-flight search navigation loses nothing', async ({
    page,
  }) => {
    await page.goto('/blog');
    await waitForList(page);
    await slowDownNavigations(page, 500);

    await searchInput(page).pressSequentially('gen', { delay: 10 });
    await page.waitForTimeout(400); // "gen" is committed and in flight
    await searchInput(page).pressSequentially('erics', { delay: 10 });

    await expectSettled(page, [['search', 'generics']], 'generics');
  });

  test('choosing a category during pending typing keeps both', async ({
    page,
  }) => {
    await page.goto('/blog');
    await waitForList(page);

    await searchInput(page).fill('grid');
    await chooseCategory(page, 'css');

    await expectSettled(
      page,
      [
        ['category', 'css'],
        ['search', 'grid'],
      ],
      'grid'
    );
    expect(await activeCategory(page)).toBe('css');
    await expect(cardTitles(page)).toHaveText(['css layout basics']);
  });

  test('choosing a category during pending typing on a slow network', async ({
    page,
  }) => {
    await page.goto('/blog');
    await waitForList(page);
    await slowDownNavigations(page, 800);

    await searchInput(page).fill('grid');
    await chooseCategory(page, 'css');

    await expectSettled(
      page,
      [
        ['category', 'css'],
        ['search', 'grid'],
      ],
      'grid'
    );
  });

  test('"all categories" keeps the committed search', async ({ page }) => {
    await page.goto('/blog?category=css&search=e');
    await waitForList(page);

    await chooseCategory(page, 'all categories');

    await expectSettled(page, [['search', 'e']], 'e');
  });
});

test('Back/Forward through search, page and category keep everything in agreement', async ({
  page,
}) => {
  const visited: string[] = [];
  const record = async () => {
    await waitForList(page);
    visited.push(new URL(page.url()).search);
  };

  await page.goto('/blog');
  await record();
  await searchInput(page).fill('e');
  await page.waitForURL('/blog?search=e');
  await record();
  await page.locator('a[href="/blog?search=e&page=2"]').click();
  await page.waitForURL('/blog?search=e&page=2');
  await record();
  await chooseCategory(page, 'typescript');
  await page.waitForURL('/blog?search=e&category=typescript');
  await record();

  const check = async (expectedSearch: string) => {
    await page.waitForTimeout(600);
    await waitForList(page);
    const url = new URL(page.url());
    expect(url.search).toBe(expectedSearch);
    await expect(searchInput(page)).toHaveValue(
      url.searchParams.get('search') ?? ''
    );
    expect(await activeCategory(page)).toBe(
      url.searchParams.get('category') ?? 'all categories'
    );
  };

  for (const expected of [...visited].reverse().slice(1)) {
    await page.goBack();
    await check(expected);
  }
  for (const expected of visited.slice(1)) {
    await page.goForward();
    await check(expected);
  }
});

test.describe('search text stays literal', () => {
  for (const literal of [
    'C++',
    'css&category=nextjs',
    'css#layout',
    'flexbox and grid',
    'مرحبا بالعالم',
  ]) {
    test(`input, page URL and API request all hold ${JSON.stringify(literal)}`, async ({
      page,
    }) => {
      await page.goto('/blog');
      await waitForList(page);
      const apiRequest = page.waitForRequest(
        (request) =>
          new URL(request.url()).pathname === '/api/blogs' &&
          new URL(request.url()).searchParams.get('search') === literal
      );

      await searchInput(page).fill(literal);

      const apiParams = new URL((await apiRequest).url()).searchParams;
      expect(apiParams.getAll('search')).toEqual([literal]);
      expect(apiParams.has('category')).toBe(false);
      await expectSettled(page, [['search', literal]], literal);
    });
  }
});
