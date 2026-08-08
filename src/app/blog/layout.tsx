import Providers from '@/app/providers';

export default function BlogAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
