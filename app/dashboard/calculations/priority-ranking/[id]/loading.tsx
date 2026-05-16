export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 h-11" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-border flex gap-4">
            <div className="h-4 w-8 rounded bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="ml-auto h-4 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
