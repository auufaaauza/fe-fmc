"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── tiny animation hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── feature card ─── */
function FeatureCard({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-7 backdrop-blur-sm
        transition-all duration-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100/50
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-slate-800">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

/* ─── step card ─── */
function StepCard({ num, title, desc, delay = 0 }: { num: string; title: string; desc: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{num}</span>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="pl-11 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

/* ─── stat item ─── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold tracking-tight text-slate-800">{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function LandingPage() {
  const hero = useInView(0.05);

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-[Poppins,system-ui,sans-serif] text-slate-800">

      {/* ── Noise / grid overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 80%)",
        }}
      />

      {/* ── Soft colour blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[22rem] w-[22rem] rounded-full bg-violet-200/15 blur-3xl" />
      </div>

      <div className="relative z-10">

        {/* ═════════ NAVBAR ═════════ */}
        <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <span className="text-base font-semibold tracking-tight text-slate-800">
              Find<span className="text-indigo-600">My</span>Career
            </span>
            <nav className="hidden items-center gap-8 text-sm text-slate-500 sm:flex">
              <a href="#fitur" className="transition-colors hover:text-slate-800">Fitur</a>
              <a href="#cara-kerja" className="transition-colors hover:text-slate-800">Cara Kerja</a>
              <a href="#tentang" className="transition-colors hover:text-slate-800">Tentang</a>
            </nav>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 active:scale-95"
            >
              Masuk
            </Link>
          </div>
        </header>

        {/* ═════════ HERO ═════════ */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-32">
          <div
            ref={hero.ref}
            className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Sistem Pendukung Keputusan berbasis SAW
            </div>

            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Temukan Jalan<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-indigo-600">Masa Depanmu</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 z-0 h-3 rounded-sm bg-indigo-100/70"
                />
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-500">
              Platform rekomendasi program studi yang memadukan nilai akademik rapor
              dan profil minat karir <span className="font-medium text-slate-700">RIASEC</span> kamu — sehingga pilihan yang diambil benar-benar mencerminkan siapa dirimu.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/60 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200/70 active:scale-95 sm:w-auto"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-95 sm:w-auto"
              >
                Sudah punya akun?
              </Link>
            </div>
          </div>

          {/* Hero visual card */}
          <div className="mt-16 flex justify-center">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
              {/* mock window bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-300" />
                <div className="mx-auto text-xs text-slate-400">find-my-career / hasil rekomendasi</div>
              </div>
              {/* mock content */}
              <div className="p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Top Rekomendasi Program Studi</p>
                {[
                  { rank: "01", name: "Ilmu Komputer", match: "88%", color: "bg-indigo-600" },
                  { rank: "02", name: "Teknik Informatika", match: "81%", color: "bg-indigo-400" },
                  { rank: "03", name: "Sistem Informasi", match: "76%", color: "bg-slate-300" },
                ].map((item) => (
                  <div key={item.rank} className="mb-3 flex items-center gap-4">
                    <span className="w-6 text-xs font-bold text-slate-400">{item.rank}</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        <span className="text-xs font-semibold text-indigo-600">{item.match}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: item.match }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════ STATS ═════════ */}
        <section className="border-y border-slate-200/60 bg-white/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-y-8 px-6 py-12 sm:grid-cols-4">
            <Stat value="59" label="Program Studi" />
            <Stat value="3" label="Kriteria Penilaian" />
            <Stat value="36" label="Soal Minat RIASEC" />
            <Stat value="SAW" label="Metode SPK" />
          </div>
        </section>

        {/* ═════════ FITUR ═════════ */}
        <section id="fitur" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">Apa yang kamu dapatkan</p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dirancang untuk siswa,<br />dipercaya oleh Guru BK</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard delay={0}   icon="📚" title="Input Nilai Rapor"        desc="Masukkan nilai mata pelajaran dari rapor semester terakhir sesuai kurikulum yang kamu jalani." />
            <FeatureCard delay={80}  icon="🧠" title="Kuesioner Minat RIASEC"   desc="Jawab 36 pertanyaan untuk mengungkap profil kepribadian dan minat karirmu secara akurat." />
            <FeatureCard delay={160} icon="📊" title="Rekomendasi Terperingkat" desc="Algoritma SAW menggabungkan nilai akademik dan minat untuk menghasilkan daftar prodi terbaik untukmu." />
            <FeatureCard delay={240} icon="🗂" title="Riwayat Perhitungan"      desc="Simpan dan bandingkan hasil rekomendasimu dari waktu ke waktu." />
            <FeatureCard delay={320} icon="👨‍🏫" title="Pantauan Guru BK"       desc="Guru BK dapat memantau perkembangan siswa, menambahkan catatan konseling, dan mengekspor laporan." />
            <FeatureCard delay={400} icon="📁" title="Import & Export Excel"    desc="Kelola data siswa secara massal dengan template Excel yang siap pakai." />
          </div>
        </section>

        {/* ═════════ CARA KERJA ═════════ */}
        <section id="cara-kerja" className="border-y border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Proses sederhana</p>
                <h2 className="mb-10 text-2xl font-bold text-slate-900 sm:text-3xl">Empat langkah menuju<br />pilihan yang tepat</h2>
                <div className="flex flex-col gap-8">
                  <StepCard delay={0}   num="1" title="Buat akun siswa"         desc="Daftarkan dirimu menggunakan informasi sekolah dan kelas yang diberikan oleh Guru BK." />
                  <StepCard delay={100} num="2" title="Isi nilai rapor"          desc="Masukkan nilai mata pelajaran semester terakhir secara lengkap agar perhitungan akurat." />
                  <StepCard delay={200} num="3" title="Jawab kuesioner RIASEC"  desc="Selesaikan 36 pertanyaan tentang minat dan kepribadian karirmu — tidak ada jawaban benar atau salah." />
                  <StepCard delay={300} num="4" title="Lihat rekomendasi"       desc="Dapatkan daftar program studi terperingkat beserta nilai kesesuaian dan penjelasan detail." />
                </div>
              </div>

              {/* Formula visual */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Formula SAW</p>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="rounded-lg bg-slate-50 px-4 py-3 text-slate-600">
                      <span className="text-indigo-600 font-semibold">r₁</span> = nilai_utama / 100
                    </div>
                    <div className="rounded-lg bg-slate-50 px-4 py-3 text-slate-600">
                      <span className="text-indigo-600 font-semibold">r₂</span> = nilai_pendukung / 100
                    </div>
                    <div className="rounded-lg bg-slate-50 px-4 py-3 text-slate-600">
                      <span className="text-indigo-600 font-semibold">r₃</span> = skor_RIASEC / 30
                    </div>
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-slate-700">
                      <span className="font-semibold text-indigo-700">Vᵢ</span> = (0.50 × r₁) + (0.20 × r₂) + (0.30 × r₃)
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  {[
                    { w: "50%", label: "Mapel Utama", color: "border-indigo-200 bg-indigo-50 text-indigo-700" },
                    { w: "20%", label: "Mapel Pendukung", color: "border-slate-200 bg-slate-50 text-slate-700" },
                    { w: "30%", label: "Minat RIASEC", color: "border-violet-200 bg-violet-50 text-violet-700" },
                  ].map((b) => (
                    <div key={b.label} className={`rounded-xl border p-3 ${b.color}`}>
                      <div className="mb-1 text-2xl font-bold">{b.w}</div>
                      <div className="leading-tight opacity-80">{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════ TENTANG ═════════ */}
        <section id="tentang" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">Latar belakang</p>
            <h2 className="mb-5 text-2xl font-bold text-slate-900 sm:text-3xl">Dibangun untuk SMAN 18 Garut</h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Memilih program studi adalah keputusan besar. Banyak siswa membuat keputusan ini tanpa panduan yang cukup
              atau hanya mengikuti tren — bukan potensi dirinya sendiri.
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              <span className="font-medium text-slate-700">Find My Career</span> hadir sebagai alat bantu Guru BK dan siswa untuk
              membuat keputusan yang lebih terinformasi, berbasis data rapor dan kesesuaian minat karir, sesuai
              regulasi <span className="font-medium text-slate-700">Kepmendikbudristek No. 345/M/2022</span>.
            </p>
          </div>
        </section>

        {/* ═════════ CTA ═════════ */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-8 py-14 text-center shadow-2xl shadow-indigo-300/40">
            {/* subtle pattern inside CTA */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)",
              }}
            />
            <p className="relative mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">Siap melangkah?</p>
            <h2 className="relative mb-4 text-2xl font-bold text-white sm:text-3xl">
              Mulai kenali dirimu hari ini
            </h2>
            <p className="relative mx-auto mb-8 max-w-md text-sm leading-relaxed text-indigo-200">
              Daftarkan akunmu sekarang dan temukan program studi yang paling sesuai dengan nilai dan minatmu.
            </p>
            <Link
              href="/register"
              className="relative inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl active:scale-95"
            >
              Daftar Gratis
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </section>

        {/* ═════════ FOOTER ═════════ */}
        <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-slate-400 sm:flex-row">
            <span>
              <span className="font-semibold text-slate-600">FindMy</span>Career — Sistem Rekomendasi Program Studi
            </span>
            <span>Studi Kasus SMAN 18 Garut · Kepmendikbudristek No. 345/M/2022</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

