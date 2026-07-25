import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-5xl text-blue-200">Welcome to the Blog App</p>
      <Link
        href={'/blog'}
        className="animate-pulse cursor-pointer rounded-4xl bg-blue-950 p-2 text-xl transition-all"
      >
        Click To Go To The Blog List
      </Link>
    </div>
  );
}
