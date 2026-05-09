export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded-md bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted" />
        </div>
        <div className="h-8 w-36 rounded-lg bg-muted" />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
          >
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-4 w-44 rounded bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
