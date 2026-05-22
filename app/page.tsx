import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLink } from "@/components/landing-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bj.png"
              alt="Banten Jaya Sport Fashion"
              width={50}
              height={50}
              className="rounded-full w-auto h-auto"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold text-primary">
                Banten Jaya Sport Fashion
              </p>
              <p className="text-xs text-muted-foreground">
                Sistem Inventaris &amp; Pendukung Keputusan
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <NavLink href="#tentang" className="hover:text-foreground transition-colors">
              Tentang
            </NavLink>
            <NavLink href="#fitur" className="hover:text-foreground transition-colors">
              Fitur
            </NavLink>
            <NavLink href="#manfaat" className="hover:text-foreground transition-colors">
              Manfaat
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-sm font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Khusus untuk Banten Jaya Sport Fashion
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Sistem Pendukung Keputusan Inventaris dengan Metode{" "}
              <span className="text-primary">TOPSIS</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Bantu pemilik toko mengambil keputusan restocking yang optimal —
              berdasarkan data penjualan, harga, margin, dan pergerakan barang
              secara real-time.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
              >
                Masuk ke Sistem
              </Link>
              <NavLink
                href="#fitur"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Lihat Fitur
              </NavLink>
            </div>
          </div>

          {/* Mock dashboard card */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-border/30">
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-foreground">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
                  Rekomendasi Restock
                </p>
                <p className="mt-1.5 text-2xl font-bold">Hasil TOPSIS</p>
              </div>
              <Image
                src="/logo-bj.png"
                alt="BJ Logo"
                width={40}
                height={40}
                className="rounded-full opacity-90"
              />
            </div>
            <div className="space-y-3">
              {[
                { rank: 1, nama: "Jersey Olahraga Premium", skor: "87.4%" },
                { rank: 2, nama: "Sepatu Badminton Pro", skor: "74.1%" },
                { rank: 3, nama: "Tas Olahraga XL", skor: "61.8%" },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-3 rounded-2xl bg-muted p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    #{item.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.nama}
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: item.skor }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {item.skor}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Berdasarkan kriteria: Penjualan · Harga · Margin · Pergerakan
              Barang
            </p>
          </div>
        </section>

        {/* Tentang */}
        <section id="tentang" className="mt-24 scroll-mt-32">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
            <div className="flex justify-center">
              <Image
                src="/logo-bj.png"
                alt="Banten Jaya Sport Fashion"
                width={140}
                height={140}
                className="rounded-full shadow-lg shadow-border"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Tentang Toko
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Banten Jaya Sport Fashion
              </h2>
              <p className="mt-1 text-muted-foreground">
                Jl. Maulana Hasanudin No. 6, RT 06/01, Kotabaru, Kota Serang,
                Banten 42112
              </p>
              <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
                Berdiri sejak <strong className="text-foreground">1990</strong>,
                Banten Jaya Sport Fashion adalah toko ritel perlengkapan
                olahraga yang melayani masyarakat Kota Serang dan sekitarnya.
                Dimulai dari penjualan pakaian dan sepatu olahraga, kini toko
                menyediakan jersey, perlengkapan bulu tangkis, tas olahraga, dan
                berbagai aksesoris sport sesuai kebutuhan pelanggan.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Sejak 1990",
                  "Kota Serang, Banten",
                  "Perlengkapan Olahraga Lengkap",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="mt-24 scroll-mt-32">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Fitur Sistem
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Semua yang dibutuhkan untuk keputusan restock yang tepat
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Kalkulasi TOPSIS",
                desc: "Hitung skor prioritas setiap barang berdasarkan kriteria yang dapat dikustomisasi — penjualan, harga, margin, dan kategori pergerakan.",
              },
              {
                label: "Priority Ranking",
                desc: "Urutan restock optimal dari perhitungan TOPSIS agar anggaran dialokasikan ke barang yang paling mendesak.",
              },
              {
                label: "Informative Result",
                desc: "Kesimpulan keputusan dalam bahasa yang mudah dipahami — bukan sekadar angka mentah.",
              },
              {
                label: "Manajemen Pengguna",
                desc: "Akses berbasis peran: Owner, Kepala Toko, dan Kepala Gudang — masing-masing dengan hak akses yang sesuai.",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {f.label}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Manfaat — selalu gelap, pakai surface-inverse */}
        <section
          id="manfaat"
          className="mt-24 scroll-mt-32 rounded-[2rem] px-8 py-14 shadow-xl"
          style={{
            backgroundColor: "var(--surface-inverse)",
            color: "var(--surface-inverse-foreground)",
          }}
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Manfaat Utama
              </p>
              <h2
                className="mt-4 text-3xl font-semibold tracking-tight"
                style={{ color: "var(--surface-inverse-foreground)" }}
              >
                Optimalkan pengeluaran restock dengan data, bukan perkiraan.
              </h2>
              <p
                className="mt-5 max-w-xl leading-8"
                style={{
                  color: "var(--surface-inverse-foreground)",
                  opacity: 0.7,
                }}
              >
                Sistem ini dirancang khusus untuk kondisi toko Banten Jaya —
                memastikan anggaran tidak terbuang untuk barang yang
                pergerakannya lambat, dan stok tidak kosong untuk barang yang
                paling dicari.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Akumulasi 100%",
                  desc: "Persentase TOPSIS selalu akurat dan terverifikasi.",
                },
                {
                  title: "Hanya Rekomendasi",
                  desc: "Sistem memberi saran — keputusan tetap di tangan pemilik.",
                },
                {
                  title: "Berbasis Peran",
                  desc: "Setiap pengguna hanya akses fitur sesuai tugasnya.",
                },
                {
                  title: "Real-time",
                  desc: "Notifikasi browser langsung saat data berubah.",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-sm font-semibold text-primary">
                    {b.title}
                  </p>
                  <p
                    className="mt-2 text-sm leading-6"
                    style={{
                      color: "var(--surface-inverse-foreground)",
                      opacity: 0.6,
                    }}
                  >
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl border border-primary/15 bg-card p-10 shadow-lg shadow-primary/8">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-bj.png"
                alt="Banten Jaya Sport Fashion"
                width={56}
                height={56}
                className="shrink-0 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Siap menggunakan sistem?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Masuk dengan akun yang telah disiapkan administrator toko.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90"
            >
              Masuk ke Sistem →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bj.png"
              alt="BJ Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-semibold text-foreground">
              Banten Jaya Sport Fashion
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Jl. Maulana Hasanudin No. 6, Kotabaru, Kota Serang, Banten 42112 ·
            Beroperasi sejak 1990
          </p>
        </div>
      </footer>
    </div>
  );
}
