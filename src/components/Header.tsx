import { House } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '../../public/icons/logo.svg';

export function Header() {
  return (
    <div className="m-2 flex items-center justify-between gap-1 rounded-xl border p-2">
      <Link href={'/'} className="flex items-center gap-1">
        <Image src={logo} alt="app logo" className="dark:text-white" />
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
