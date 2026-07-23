import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2>404 - Page Not Found</h2>
      <p>Could not find the requested resource.</p>
      <Link href="/blog" className="mt-4 text-blue-500 underline">
        Return To Blog List
      </Link>
    </div>
  );
}
