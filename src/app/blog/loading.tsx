export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3 text-lg font-medium text-gray-600">Loading...</p>
    </div>
  );
}
