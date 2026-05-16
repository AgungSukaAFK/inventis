export default function Loading() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-96 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-12 rounded-lg bg-muted animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 rounded-xl border border-border bg-muted/30 animate-pulse" />
      ))}
    </div>
  );
}
