import { isApiErrorResponse } from '@/lib/blogs/guards';

// Browser-side JSON fetch used by the TanStack Query functions.
// Paths are relative ('/api/...') and resolve against the current origin, so
// no base URL or environment variable is needed. Server Components must not
// use this; they read data through src/server/blogs/data.ts instead.
//
// Failure policy: every expected failure is *returned* as a Result, never
// thrown, and says which kind of failure it was:
//   network - no response at all (offline, DNS, connection reset...)
//   http    - the server answered with a non-2xx status
//   parse   - the response body was not valid JSON
// The data is returned as `unknown`: callers check its shape before use.

export type FetchError =
  | { kind: 'network'; message: string }
  | { kind: 'http'; status: number; message: string }
  | { kind: 'parse'; status: number; message: string };

export type Result<T> =
  { ok: true; data: T } | { ok: false; error: FetchError };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// The API's error body is { error: string }; use it when present.
async function httpErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isApiErrorResponse(body)) {
      return body.error;
    }
  } catch {
    // Body was not JSON; fall back to the status text below.
  }
  return response.statusText || `HTTP ${response.status}`;
}

export async function fetchData(path: string): Promise<Result<unknown>> {
  let response: Response;
  try {
    response = await fetch(path);
  } catch (error) {
    return { ok: false, error: { kind: 'network', message: messageOf(error) } };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        kind: 'http',
        status: response.status,
        message: await httpErrorMessage(response),
      },
    };
  }

  try {
    return { ok: true, data: await response.json() };
  } catch (error) {
    return {
      ok: false,
      error: {
        kind: 'parse',
        status: response.status,
        message: messageOf(error),
      },
    };
  }
}

// Short diagnostic text, e.g. "http 400: page must be a positive integer".
export function describeFetchError(error: FetchError): string {
  const status = error.kind === 'network' ? '' : ` ${error.status}`;
  return `${error.kind}${status}: ${error.message}`;
}

const MAX_QUERY_RETRIES = 3;

// TanStack Query retry policy. A 400 means the request itself was rejected
// by validation, so sending it again cannot succeed: show the error at once.
// Everything else (network errors, 5xx, and 4xx statuses that can be
// temporary, such as 408 or 429) keeps the default of 3 retries.
// Reads the structured failure kept as the error's `cause`, not its message.
export function shouldRetryQuery(failureCount: number, error: Error): boolean {
  const cause: unknown = error.cause;
  const isValidationError =
    typeof cause === 'object' &&
    cause !== null &&
    'kind' in cause &&
    cause.kind === 'http' &&
    'status' in cause &&
    cause.status === 400;
  return !isValidationError && failureCount < MAX_QUERY_RETRIES;
}
