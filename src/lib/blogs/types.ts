// Shared blog types. Safe to import from both Server and Client Components.

// In-memory shape: `date` is a real Date.
export interface Blog {
  title: string;
  slug: string;
  date: Date;
  content: string;
  category: string;
  image: string;
}

// Source shape in the data store, before derived fields (image) are added.
export type StoredBlog = Omit<Blog, 'image'>;

// Wire shape after JSON serialization: `date` becomes an ISO string.
export type RawData = Omit<Blog, 'date'> & { date: string };

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

// GET /api/blogs
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// GET /api/categories
export interface ListResponse<T> {
  data: T[];
}

// Every API error (400, 404) uses this body.
export interface ApiErrorResponse {
  error: string;
}
