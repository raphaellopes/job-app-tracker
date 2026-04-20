export default function JobViewModalFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[90vh] sm:mx-4 sm:rounded-2xl bg-white shadow-xl p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-56 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-100" />
          <div className="h-[70vh] rounded bg-gray-50 border border-gray-100" />
        </div>
      </div>
    </div>
  );
}
