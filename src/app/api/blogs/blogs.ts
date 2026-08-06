export interface Blog {
  title: string;
  slug: string;
  date: Date;
  content: string;
  category: string;
}

export interface RawData {
  title: string;
  slug: string;
  date: string;
  content: string;
  category: string;
}

export interface SentRawData<T> {
  data: T;
  meta: { total: number; page: number; limit: number; hasNextPage: boolean };
}

const blogs: Record<string, Blog> = {
  'first-blog': {
    title: 'typescript mastery',
    slug: 'first-blog',
    date: new Date('2026-01-01'),
    content: 'we have started the new era of coding',
    category: 'typescript',
  },
  'second-blog': {
    title: 'nextjs mastery',
    slug: 'second-blog',
    date: new Date('2026-01-02'),
    content: 'first frame work to master',
    category: 'nextjs',
  },
  'third-blog': {
    title: 'understanding generics',
    slug: 'third-blog',
    date: new Date('2026-01-03'),
    content: 'generics let you write reusable typed code',
    category: 'typescript',
  },
  'fourth-blog': {
    title: 'server components explained',
    slug: 'fourth-blog',
    date: new Date('2026-01-04'),
    content: 'server components run only on the server',
    category: 'nextjs',
  },
  'fifth-blog': {
    title: 'discriminated unions in practice',
    slug: 'fifth-blog',
    date: new Date('2026-01-05'),
    content: 'narrowing types with a common tag field',
    category: 'typescript',
  },
  'sixth-blog': {
    title: 'route handlers deep dive',
    slug: 'sixth-blog',
    date: new Date('2026-01-06'),
    content: 'building your own api endpoints',
    category: 'nextjs',
  },
  'seventh-blog': {
    title: 'the result pattern',
    slug: 'seventh-blog',
    date: new Date('2026-01-07'),
    content: 'handling failure without throwing everywhere',
    category: 'typescript',
  },
  'eighth-blog': {
    title: 'dynamic routing with slugs',
    slug: 'eighth-blog',
    date: new Date('2026-01-08'),
    content: 'building detail pages from a single template',
    category: 'nextjs',
  },
  'ninth-blog': {
    title: 'css layout basics',
    slug: 'ninth-blog',
    date: new Date('2026-01-09'),
    content: 'flexbox and grid fundamentals',
    category: 'css',
  },
  'tenth-blog': {
    title: 'utility classes explained',
    slug: 'tenth-blog',
    date: new Date('2026-01-10'),
    content: 'why tailwind trades html verbosity for speed',
    category: 'css',
  },
  'eleventh-blog': {
    title: 'async await mechanics',
    slug: 'eleventh-blog',
    date: new Date('2026-01-11'),
    content: 'promises under the hood',
    category: 'javascript',
  },
  'twelfth-blog': {
    title: 'array methods you should know',
    slug: 'twelfth-blog',
    date: new Date('2026-01-12'),
    content: 'map filter reduce slice explained',
    category: 'javascript',
  },
  'thirteenth-blog': {
    title: 'loading and error conventions',
    slug: 'thirteenth-blog',
    date: new Date('2026-01-13'),
    content: 'special files that hook into the app router',
    category: 'nextjs',
  },
  'fourteenth-blog': {
    title: 'offset based pagination',
    slug: 'fourteenth-blog',
    date: new Date('2026-01-14'),
    content: 'slicing arrays by page and limit',
    category: 'typescript',
  },
};

export default blogs;
