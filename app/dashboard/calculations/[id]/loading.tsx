export default function CalculationDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-7 w-72 rounded-md bg-muted" />
        <div className="h-4 w-48 rounded-md bg-muted" />
        <div className="h-3 w-96 rounded bg-muted" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3 flex gap-4">
          {[40, 160, 80, 70, 60, 90, 80, 100].map((w, i) => (
            <div key={i} className="h-4 rounded bg-muted" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="h-4 w-6 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
            <div className="h-4 w-12 rounded bg-muted ml-auto" />
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-10 rounded bg-muted" />
            <div className="h-4 w-10 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
