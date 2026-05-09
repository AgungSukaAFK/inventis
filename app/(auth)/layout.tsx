import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventis — Masuk",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-20 -right-16 h-96 w-96 rounded-full bg-primary/12 blur-[80px]" />
        <div className="absolute top-1/4 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-[80px]" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
