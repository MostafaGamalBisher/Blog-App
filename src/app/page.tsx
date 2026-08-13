import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-3xl text-blue-200">Welcome to Al-Mdrasa Blog App</p>
      <Link
        href={'/blog'}
        className="bg-background animate-pulse cursor-pointer rounded-4xl p-2 text-xl transition-all"
      >
        Click To Go To The Blog List
      </Link>
    </div>
  );
}
