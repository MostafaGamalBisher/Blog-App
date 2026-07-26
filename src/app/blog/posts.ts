export interface Post {
  title: string;
  slug: string;
  date: Date;
  content: string;
  category: string;
}

const posts: Record<string, Post> = {
  'first-post': {
    title: 'typescript mastery',
    slug: 'first-post',
    date: new Date('2026-01-01'),
    content: 'we have started the new era of coding',
    category: 'typescript',
  },
  'second-post': {
    title: 'nextjs mastery',
    slug: 'second-post',
    date: new Date('2026-01-02'),
    content: 'first frame work to master',
    category: 'nextjs',
  },
};

export default posts;
