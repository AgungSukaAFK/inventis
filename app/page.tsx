import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bj.png"
              alt="Banten Jaya Sport Fashion"
              width={80}
              height={80}
              className="rounded-full w-auto h-auto"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold text-red-600">
                Banten Jaya Sport Fashion
              </p>
              <p className="text-xs text-slate-500">
                Sistem Inventaris &amp; Pendukung Keputusan
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-700 md:flex">
            <a
              href="#tentang"
              className="hover:text-slate-900 transition-colors"
            >
              Tentang
            </a>
            <a href="#fitur" className="hover:text-slate-900 transition-colors">
              Fitur
            </a>
            <a
              href="#manfaat"
              className="hover:text-slate-900 transition-colors"
            >
              Manfaat
            </a>
          </nav>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Khusus untuk Banten Jaya Sport Fashion
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Sistem Pendukung Keputusan Inventaris dengan Metode{" "}
              <span className="text-red-600">TOPSIS</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Bantu pemilik toko mengambil keputusan restocking yang optimal —
              berdasarkan data penjualan, harga, margin, dan pergerakan barang
              secara real-time.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Masuk ke Sistem
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Lihat Fitur
              </a>
            </div>
          </div>

          {/* Mock dashboard card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-red-600 p-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-100">
                  Rekomendasi Restock
                </p>
                <p className="mt-1.5 text-2xl font-bold">Hasil TOPSIS</p>
              </div>
              <Image
                src="/logo-bj.png"
                alt="BJ Logo"
                width={20}
                height={20}
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
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                    #{item.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.nama}
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: item.skor }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-red-600">
                    {item.skor}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Berdasarkan kriteria: Penjualan · Harga · Margin · Pergerakan
              Barang
            </p>
          </div>
        </section>

        {/* Tentang */}
        <section id="tentang" className="mt-24">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
            <div className="flex justify-center">
              <Image
                src="/logo-bj.png"
                alt="Banten Jaya Sport Fashion"
                width={140}
                height={140}
                className="rounded-full shadow-lg shadow-slate-200"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
                Tentang Toko
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Banten Jaya Sport Fashion
              </h2>
              <p className="mt-1 text-slate-500">
                Jl. Maulana Hasanudin No. 6, RT 06/01, Kotabaru, Kota Serang,
                Banten 42112
              </p>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                Berdiri sejak <strong>1990</strong>, Banten Jaya Sport Fashion
                adalah toko ritel perlengkapan olahraga yang melayani masyarakat
                Kota Serang dan sekitarnya. Dimulai dari penjualan pakaian dan
                sepatu olahraga, kini toko menyediakan jersey, perlengkapan bulu
                tangkis, tas olahraga, dan berbagai aksesoris sport sesuai
                kebutuhan pelanggan.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Sejak 1990",
                  "Kota Serang, Banten",
                  "Perlengkapan Olahraga Lengkap",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="mt-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
              Fitur Sistem
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
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
                label: "Restock Calculator",
                desc: "Hitung kuantitas restock yang efisien berdasarkan hasil TOPSIS dan anggaran yang tersedia.",
              },
              {
                label: "Adaptive Safety Stock",
                desc: "Penyesuaian stok aman secara otomatis mengikuti tren penjualan dan kapasitas anggaran toko.",
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
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {f.label}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Manfaat */}
        <section
          id="manfaat"
          className="mt-24 rounded-[2rem] bg-slate-950 px-8 py-14 text-white shadow-xl shadow-slate-900/30"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
                Manfaat Utama
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Optimalkan pengeluaran restock dengan data, bukan perkiraan.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-slate-300">
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
                <div key={b.title} className="rounded-2xl bg-slate-900/80 p-5">
                  <p className="text-sm font-semibold text-red-400">
                    {b.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl border border-red-100 bg-white p-10 shadow-lg shadow-red-100/30">
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
                <h2 className="text-2xl font-semibold text-slate-900">
                  Siap menggunakan sistem?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Masuk dengan akun yang telah disiapkan administrator toko.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
            >
              Masuk ke Sistem →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bj.png"
              alt="BJ Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-semibold text-slate-700">
              Banten Jaya Sport Fashion
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Jl. Maulana Hasanudin No. 6, Kotabaru, Kota Serang, Banten 42112 ·
            Beroperasi sejak 1990
          </p>
        </div>
      </footer>
    </div>
  );
}
