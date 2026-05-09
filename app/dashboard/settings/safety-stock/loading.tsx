export default function SafetyStockSettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-md bg-muted" />
        <div className="h-4 w-80 rounded-md bg-muted" />
      </div>
      <div className="h-11 rounded-lg bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-4 py-4 border-b border-border">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <div className="h-5 w-14 rounded bg-muted" />
                  <div className="h-5 w-14 rounded-full bg-muted" />
                </div>
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-64 rounded bg-muted" />
              </div>
              <div className="h-8 w-16 rounded bg-muted shrink-0" />
            </div>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-6 w-8 rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
