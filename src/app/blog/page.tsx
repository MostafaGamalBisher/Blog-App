interface Post {
  title: string;
  slug: string;
  date: Date;
  content: string;
}

const posts: Record<string, Post> = {
  'first-post': {
    title: 'typescript mastery',
    slug: 'first-post',
    date: new Date('1 - 1 - 2026'),
    content: 'we have started the new era of coding',
  },
  'second-post': {
    title: 'nextjs mastery',
    slug: 'second-post',
    date: new Date('2 - 1 - 2026'),
    content: 'first frame work to master',
  },
};
