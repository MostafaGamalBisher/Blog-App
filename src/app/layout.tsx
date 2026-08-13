import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/app/theme-provider';
import { ThemeToggle } from '@/app/blog/ThemeToggle';
import Image from 'next/image';
import logo from '../../public/icons/logo.svg';
import Link from 'next/link';
import { House } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Blog App',
  description: 'Project description',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="m-2 flex items-center justify-between gap-1">
            <Link href={'/'} className="flex items-center gap-1">
              <Image src={logo} alt="app logo" className="dark:text-white" />
              <span>Blog</span>
            </Link>
            <Link
              className="text-primary flex transition-colors hover:text-blue-400"
              href={'/'}
            >
              <House />
              <span>Home</span>
            </Link>
            <ThemeToggle />
          </div>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
