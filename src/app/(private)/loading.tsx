export default function PrivateLoading() {
  return (
    <main className="p-4 sm:p-6 lg:p-10 min-h-screen">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 rounded-lg border border-gray-100 bg-white" />
          <div className="h-44 rounded-lg border border-gray-100 bg-white" />
        </div>

        <div className="h-72 rounded-lg border border-gray-100 bg-white" />
      </div>
    </main>
  );
}
