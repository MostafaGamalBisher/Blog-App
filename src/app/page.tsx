import Link from 'next/link';

export default function Home() {
  return (
    <div className="m-5 flex flex-col items-center justify-center gap-4">
      <p className="text-primary font-nunito text-xl lg:text-3xl">
        Welcome to Al-Mdrasa Blog App
      </p>
      <Link
        href={'/blog'}
        className="bg-background font-heading animate-pulse cursor-pointer rounded-4xl border p-2 text-xl transition-all"
      >
        Click To Go To The Blog List
      </Link>
    </div>
  );
}
