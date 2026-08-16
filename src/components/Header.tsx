import { House, PenTool } from 'lucide-react';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <div className="m-2 flex items-center justify-between gap-1 rounded-xl border p-2">
      <Link href={'/'} className="flex items-center gap-1">
        <PenTool />

        <span>Blog</span>
      </Link>
      <Link
        className="text-primary flex gap-2 transition-colors hover:text-blue-400"
        href={'/'}
      >
        <House />
        <span className="translate-y-1">Home</span>
      </Link>
      <ThemeToggle />
    </div>
  );
}
