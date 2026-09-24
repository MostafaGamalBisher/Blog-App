// Parameter rules shared by GET /api/blogs (src/app/api/blogs/listQuery.ts)
// and the /blog page (src/lib/blogs/pageParams.ts), so both reject the same
// inputs in the same way.
//
// Each function receives *all* values given for one parameter
// (URLSearchParams.getAll, or the page's searchParams entry as an array),
// so a repeated parameter can never be mistaken for a single value.

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const PLAIN_POSITIVE_INTEGER = /^[1-9][0-9]*$/;

// At most one value. More than one is invalid.
export function singleValue(
  key: string,
  values: readonly string[]
): Parsed<string | undefined> {
  if (values.length > 1) {
    return { ok: false, error: `${key} must not be repeated` };
  }
  return { ok: true, value: values[0] };
}

// Absent -> `fallback`. Present -> plain digits for a positive safe integer
// (no sign, decimals, spaces or leading zeros). An empty value is present,
// so it is invalid rather than defaulted.
export function positiveInteger(
  key: string,
  values: readonly string[],
  fallback: number
): Parsed<number> {
  const raw = singleValue(key, values);
  if (!raw.ok) {
    return raw;
  }
  if (raw.value === undefined) {
    return { ok: true, value: fallback };
  }
  if (!PLAIN_POSITIVE_INTEGER.test(raw.value)) {
    return { ok: false, error: `${key} must be a positive integer` };
  }
  const value = Number(raw.value);
  if (!Number.isSafeInteger(value)) {
    return { ok: false, error: `${key} is too large` };
  }
  return { ok: true, value };
}

// A text filter such as category or search: at most one value; absent or
// empty means "no filter". The value is otherwise kept exactly as given, so
// commas, plus signs, `&`, `#` and non-Latin text stay literal.
export function optionalFilter(
  key: string,
  values: readonly string[]
): Parsed<string | undefined> {
  const raw = singleValue(key, values);
  if (!raw.ok) {
    return raw;
  }
  return { ok: true, value: raw.value || undefined };
}
