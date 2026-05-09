export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 rounded-md bg-muted" />
          <div className="h-4 w-44 rounded-md bg-muted" />
        </div>
        <div className="h-8 w-32 rounded-lg bg-muted" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-36 rounded-md bg-muted" />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
          >
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-5 w-24 rounded-full bg-muted" />
            <div className="h-4 w-24 rounded bg-muted ml-auto" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
