type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function fetchData<T>(url: string): Promise<Result<T>> {
  const response = await fetch(url);

  if (!response.ok) {
    return { ok: false, error: `Failed to fetch Blogs` };
  } else {
    const parsedValue = await response.json();

    return { ok: true, data: parsedValue };
  }
}
