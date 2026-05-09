export default function CategoriesLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 rounded-md bg-muted" />
        <div className="h-4 w-64 rounded-md bg-muted" />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
          <div className="h-8 w-36 rounded-lg bg-muted" />
        </div>
        <div className="border-t border-border divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-7 w-7 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
