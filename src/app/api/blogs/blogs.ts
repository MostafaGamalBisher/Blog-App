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
};

export default blogs;
