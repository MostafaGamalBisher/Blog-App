type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return 'https://' + process.env.VERCEL_URL;
  } else {
    if (!process.env.SITE_URL) {
      throw new Error(`SITE_URL went wrong`);
    }
    return process.env.SITE_URL;
  }
}

export async function fetchData<T>(path: string): Promise<Result<T>> {
  const currentEnv = getBaseUrl();

  const response = await fetch(currentEnv + path);

  if (!response.ok) {
    return { ok: false, error: `Failed to fetch Blogs` };
  } else {
    const parsedValue = await response.json();

    return { ok: true, data: parsedValue };
  }
}
