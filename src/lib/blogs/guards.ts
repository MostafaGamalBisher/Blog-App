import type {
  ApiErrorResponse,
  ListResponse,
  PaginatedResponse,
  PaginationMeta,
  RawData,
} from '@/lib/blogs/types';

// Runtime checks for JSON received from the API. A TypeScript type only
// describes what we expect; these functions check what actually arrived.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isRawBlog(value: unknown): value is RawData {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.content === 'string' &&
    typeof value.category === 'string' &&
    typeof value.image === 'string' &&
    typeof value.date === 'string' &&
    !Number.isNaN(Date.parse(value.date))
  );
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
  return (
    isRecord(value) &&
    Number.isInteger(value.total) &&
    Number.isInteger(value.page) &&
    Number.isInteger(value.limit) &&
    typeof value.hasNextPage === 'boolean'
  );
}

export function isPaginatedRawBlogs(
  value: unknown
): value is PaginatedResponse<RawData> {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isRawBlog) &&
    isPaginationMeta(value.meta)
  );
}

export function isStringList(value: unknown): value is ListResponse<string> {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every((item) => typeof item === 'string')
  );
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return isRecord(value) && typeof value.error === 'string';
}
