import { expect, type Page } from '@playwright/test';

// SearchBar commits typed text 300 ms after typing stops. Waiting several
// times longer shows whether a pending commit fired after all.
export const DEBOUNCE_WINDOW_MS = 1200;

export function searchInput(page: Page) {
  return page.locator('input[type=search]');
}

export function cardTitles(page: Page) {
  return page.locator('ul li h2');
}

// Every parameter of the current page URL, in order (repeats included).
export function urlParams(page: Page): [string, string][] {
  return [...new URL(page.url()).searchParams];
}

// Wait until the list has finished loading (cards, empty or error state).
export async function waitForList(page: Page) {
  await expect(page.getByText('loading...', { exact: true })).toHaveCount(0);
  await expect(
    cardTitles(page)
      .first()
      .or(page.getByText('No Blogs to render'))
      .or(page.getByText("Couldn't load blogs."))
  ).toBeVisible();
}

// Give any pending debounce time to fire, then check that the URL and the
// search box show exactly the expected state.
export async function expectSettled(
  page: Page,
  params: [string, string][],
  inputValue: string
) {
  await page.waitForTimeout(DEBOUNCE_WINDOW_MS);
  await waitForList(page);
  expect(urlParams(page)).toEqual(params);
  await expect(searchInput(page)).toHaveValue(inputValue);
}

export async function chooseCategory(page: Page, name: string) {
  await page.getByRole('button', { name: 'Select Category' }).click();
  await page.getByRole('menuitemradio', { name, exact: true }).click();
}

export async function activeCategory(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Select Category' }).click();
  const checked = page.locator('[role=menuitemradio][aria-checked=true]');
  const text = (await checked.innerText()).trim();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  return text;
}

// Delay the router's page-data (RSC) requests, to simulate a slow network
// in which a navigation is still in flight when the debounce fires.
export async function slowDownNavigations(page: Page, delayMs: number) {
  await page.route(
    (url) => url.pathname.startsWith('/blog'),
    async (route) => {
      if (route.request().headers()['rsc']) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      await route.continue();
    }
  );
}
