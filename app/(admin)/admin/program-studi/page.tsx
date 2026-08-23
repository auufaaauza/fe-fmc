"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Binary,
  BookOpen,
  Edit,
  GraduationCap,
  Landmark,
  Layers,
  Plus,
  Search,
  Sliders,
  Sparkles,
  TreePine,
  Users2,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { InterestCategory, StudyProgram, Subject } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

type RumpunType = "ALL" | "HUMANIORA" | "ILMU_SOSIAL" | "ILMU_ALAM" | "ILMU_FORMAL" | "ILMU_TERAPAN";

const rumpunMapping: Record<string, RumpunType> = {
  // 1. Humaniora
  Seni: "HUMANIORA",
  Sejarah: "HUMANIORA",
  Linguistik: "HUMANIORA",
  Susastra: "HUMANIORA",
  Filsafat: "HUMANIORA",
  "Studi Humanitas": "HUMANIORA",

  // 2. Ilmu Sosial
  "Ilmu Sosial": "ILMU_SOSIAL",
  Ekonomi: "ILMU_SOSIAL",
  Pertahanan: "ILMU_SOSIAL",
  Psikologi: "ILMU_SOSIAL",
  Hukum: "ILMU_SOSIAL",
  "Ilmu Militer": "ILMU_SOSIAL",
  "Administrasi Publik": "ILMU_SOSIAL",
  "Ilmu Komunikasi": "ILMU_SOSIAL",
  Pariwisata: "ILMU_SOSIAL",

  // 3. Ilmu Alam
  Kimia: "ILMU_ALAM",
  "Ilmu Kebumian": "ILMU_ALAM",
  "Ilmu Kelautan": "ILMU_ALAM",
  Biologi: "ILMU_ALAM",
  Biofisika: "ILMU_ALAM",
  Fisika: "ILMU_ALAM",
  Astronomi: "ILMU_ALAM",
  "Ilmu Lingkungan": "ILMU_ALAM",
  Kehutanan: "ILMU_ALAM",
  "Konservasi Biologi": "ILMU_ALAM",

  // 4. Ilmu Formal
  "Ilmu Komputer": "ILMU_FORMAL",
  Logika: "ILMU_FORMAL",
  Matematika: "ILMU_FORMAL",
  "Sains Data": "ILMU_FORMAL",
  "Ilmu Informasi": "ILMU_FORMAL",

  // 5. Ilmu Terapan
  "Ilmu Pertanian": "ILMU_TERAPAN",
  Peternakan: "ILMU_TERAPAN",
  "Ilmu Perikanan": "ILMU_TERAPAN",
  Arsitektur: "ILMU_TERAPAN",
  "Perencanaan Wilayah dan Kota": "ILMU_TERAPAN",
  Desain: "ILMU_TERAPAN",
  Akuntansi: "ILMU_TERAPAN",
  Manajemen: "ILMU_TERAPAN",
  Logistik: "ILMU_TERAPAN",
  "Administrasi Bisnis": "ILMU_TERAPAN",
  Bisnis: "ILMU_TERAPAN",
  Pendidikan: "ILMU_TERAPAN",
  Teknik: "ILMU_TERAPAN",
  Kedokteran: "ILMU_TERAPAN",
  "Kedokteran Gigi": "ILMU_TERAPAN",
  "Kedokteran Hewan": "ILMU_TERAPAN",
  Farmasi: "ILMU_TERAPAN",
  Gizi: "ILMU_TERAPAN",
  "Kesehatan Masyarakat": "ILMU_TERAPAN",
  Kebidanan: "ILMU_TERAPAN",
  Keperawatan: "ILMU_TERAPAN",
  Kesehatan: "ILMU_TERAPAN",
  "Ilmu Keolahragaan": "ILMU_TERAPAN",
  Transportasi: "ILMU_TERAPAN",
  Bioteknologi: "ILMU_TERAPAN",
  Geografi: "ILMU_TERAPAN",
  "Informatika Medis": "ILMU_TERAPAN",
  "Teknologi Pangan": "ILMU_TERAPAN",
  "Sains Perkopian": "ILMU_TERAPAN",
};

const rumpunTabs: { value: RumpunType; label: string; icon: any }[] = [
  { value: "ALL", label: "Semua Rumpun", icon: Layers },
  { value: "HUMANIORA", label: "Humaniora", icon: Landmark },
  { value: "ILMU_SOSIAL", label: "Ilmu Sosial", icon: Users2 },
  { value: "ILMU_ALAM", label: "Ilmu Alam", icon: TreePine },
  { value: "ILMU_FORMAL", label: "Ilmu Formal", icon: Binary },
  { value: "ILMU_TERAPAN", label: "Ilmu Terapan", icon: Wrench },
];

function getRumpun(programName: string): RumpunType {
  return rumpunMapping[programName] || "ILMU_TERAPAN";
}

function getRumpunDisplay(rumpun: RumpunType): { label: string; badgeClass: string } {
  switch (rumpun) {
    case "HUMANIORA":
      return { label: "Humaniora", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" };
    case "ILMU_SOSIAL":
      return { label: "Ilmu Sosial", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" };
    case "ILMU_ALAM":
      return { label: "Ilmu Alam", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "ILMU_FORMAL":
      return { label: "Ilmu Formal", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" };
    case "ILMU_TERAPAN":
    default:
      return { label: "Ilmu Terapan", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  }
}

const emptyProgram = {
  name: "",
  faculty: "",
  description: "",
  career_paths: "",
  learning_path: "",
  primary_subject_id: "1",
  primary_weight: "0.40",
  secondary_subject_id: "",
  secondary_weight: "0.30",
  interest_category_id: "1",
  interest_weight: "0.30",
};

export default function ProgramStudiPage() {
  const [programs, setPrograms] = useState<StudyProgram[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudyProgram | null>(null);
  const [form, setForm] = useState(emptyProgram);
  const [selectedRumpun, setSelectedRumpun] = useState<RumpunType>("ALL");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  async function loadData() {
    try {
      const [resPrograms, resSubjects, resCategories] = await Promise.allSettled([
        api.get("/admin/study-programs"),
        api.get("/subjects"),
        api.get("/interest-categories"),
      ]);

      if (resPrograms.status === "fulfilled") {
        setPrograms(resPrograms.value.data.data || []);
      }
      if (resSubjects.status === "fulfilled") {
        setSubjects(resSubjects.value.data.data || []);
      }
      if (resCategories.status === "fulfilled") {
        setCategories(resCategories.value.data.data || []);
      }
    } catch (error: any) {
      toast({
        title: "Gagal memuat program studi",
        description: error.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const pRumpun = getRumpun(program.name);
      const matchesRumpun = selectedRumpun === "ALL" || pRumpun === selectedRumpun;
      const matchesSearch = `${program.name} ${program.faculty ?? ""} ${program.description ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesRumpun && matchesSearch;
    });
  }, [programs, selectedRumpun, search]);

  const rumpunCounts = useMemo(() => {
    const counts: Record<RumpunType, number> = {
      ALL: programs.length,
      HUMANIORA: 0,
      ILMU_SOSIAL: 0,
      ILMU_ALAM: 0,
      ILMU_FORMAL: 0,
      ILMU_TERAPAN: 0,
    };
    programs.forEach((p) => {
      const r = getRumpun(p.name);
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [programs]);

  function startCreate() {
    setEditing(null);
    setForm(emptyProgram);
    setOpen(true);
  }

  function startEdit(program: StudyProgram) {
    const criteria = program.criteria;
    setEditing(program);
    setForm({
      name: program.name,
      faculty: program.faculty ?? "",
      description: program.description ?? "",
      career_paths: (program.career_paths ?? []).join(", "),
      learning_path: Object.entries(program.learning_path ?? {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
      primary_subject_id: String(criteria?.primary_subject_id ?? 1),
      primary_weight: String(criteria?.primary_weight ?? "0.40"),
      secondary_subject_id: criteria?.secondary_subject_id
        ? String(criteria.secondary_subject_id)
        : "",
      secondary_weight: String(criteria?.secondary_weight ?? "0.30"),
      interest_category_id: String(criteria?.interest_category_id ?? 1),
      interest_weight: String(criteria?.interest_weight ?? "0.30"),
    });
    setOpen(true);
  }

  function payload() {
    const learningPath = Object.fromEntries(
      form.learning_path
        .split("\n")
        .map((line) => line.split(":"))
        .filter((parts) => parts.length >= 2)
        .map(([key, ...rest]) => [key.trim(), rest.join(":").trim()])
    );

    return {
      name: form.name,
      faculty: form.faculty,
      description: form.description,
      career_paths: form.career_paths
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      learning_path: learningPath,
      criteria: {
        primary_subject_id: Number(form.primary_subject_id),
        primary_weight: Number(form.primary_weight),
        secondary_subject_id: form.secondary_subject_id
          ? Number(form.secondary_subject_id)
          : null,
        secondary_weight: Number(form.secondary_weight),
        interest_category_id: Number(form.interest_category_id),
        interest_weight: Number(form.interest_weight),
      },
    };
  }

  async function saveProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/study-programs/${editing.id}`, payload());
      } else {
        await api.post("/admin/study-programs", payload());
      }
      toast({
        title: "Berhasil",
        description: "Program studi disimpan.",
        type: "success",
      });
      setOpen(false);
      await loadData();
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan program studi",
        description: error.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Program Studi & Kriteria SAW"
        description="Referensi 59 Kelompok Program Studi resmi berdasarkan Kepmendikdasmen No. 102/M/2025."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs sm:text-sm">
                <Plus className="h-4 w-4" />
                Tambah Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  {editing ? "Edit Program Studi & Bobot SAW" : "Tambah Program Studi Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={saveProgram} className="space-y-4 pt-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Program Studi</label>
                  <Input
                    placeholder="Contoh: Ilmu Komputer"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    className="rounded-xl border-slate-200 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Fakultas / Rumpun</label>
                  <Input
                    placeholder="Contoh: Fakultas Ilmu Komputer"
                    value={form.faculty}
                    onChange={(event) =>
                      setForm({ ...form, faculty: event.target.value })
                    }
                    className="rounded-xl border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Deskripsi</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-20"
                    placeholder="Deskripsi singkat keilmuan dan pembelajaran..."
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    Prospek Karir (Pisahkan dengan koma)
                  </label>
                  <Input
                    placeholder="Software Engineer, Data Scientist, Konsultan IT"
                    value={form.career_paths}
                    onChange={(event) =>
                      setForm({ ...form, career_paths: event.target.value })
                    }
                    className="rounded-xl border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                {/* Criteria SAW Config */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950">
                    <Sliders className="h-4 w-4 text-indigo-600" />
                    <span>Konfigurasi Kriteria SAW</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Mapel Utama (C1)</label>
                      <select
                        value={form.primary_subject_id}
                        onChange={(e) => setForm({ ...form, primary_subject_id: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Bobot C1 (0.40)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.primary_weight}
                        onChange={(e) => setForm({ ...form, primary_weight: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Mapel Pendukung (C2)</label>
                      <select
                        value={form.secondary_subject_id}
                        onChange={(e) => setForm({ ...form, secondary_subject_id: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="">-- Tidak Ada --</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Bobot C2 (0.30)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.secondary_weight}
                        onChange={(e) => setForm({ ...form, secondary_weight: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Kategori Minat (C3)</label>
                      <select
                        value={form.interest_category_id}
                        onChange={(e) => setForm({ ...form, interest_category_id: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Bobot C3 (0.30)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.interest_weight}
                        onChange={(e) => setForm({ ...form, interest_weight: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                  Simpan Program Studi
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* ── FILTER RUMPUN ILMU TABS & PENCARIAN ── */}
      <div className="space-y-3">
        {/* Rumpun Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {rumpunTabs.map((tab) => {
            const isSelected = selectedRumpun === tab.value;
            const count = rumpunCounts[tab.value] ?? 0;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedRumpun(tab.value)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Result Summary */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
          <div className="relative flex-1 max-w-md">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama program studi, fakultas, atau kata kunci..."
              className="pl-9 text-xs sm:text-sm rounded-xl border-slate-200"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{filteredPrograms.length}</strong> dari {programs.length} program studi
          </div>
        </div>
      </div>

      {/* ── LIST OF STUDY PROGRAMS ── */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredPrograms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="font-medium text-slate-500 text-sm">
              Tidak ada program studi yang cocok dengan filter rumpun atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          filteredPrograms.map((program, idx) => {
            const pRumpun = getRumpun(program.name);
            const rumpunInfo = getRumpunDisplay(pRumpun);

            return (
              <article
                key={program.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100/80">
                        {idx + 1}
                      </span>
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                        {program.name}
                      </h2>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${rumpunInfo.badgeClass}`}>
                        {rumpunInfo.label}
                      </span>
                      {program.faculty && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {program.faculty}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {program.description}
                    </p>

                    {/* Prospek Karir */}
                    {program.career_paths && program.career_paths.length > 0 && (
                      <div className="text-xs rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                        <strong className="font-medium text-slate-800">Prospek Karir: </strong>
                        <span className="text-slate-600">
                          {program.career_paths.join(" • ")}
                        </span>
                      </div>
                    )}

                    {/* Kriteria & Bobot SAW */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 text-indigo-900 font-medium">
                        C1 Utama: <strong>{program.criteria?.primary_subject?.name || "-"}</strong> ({program.criteria?.primary_weight})
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50/80 border border-blue-100 px-2.5 py-1 text-blue-900 font-medium">
                        C2 Pendukung: <strong>{program.criteria?.secondary_subject?.name || "Tidak ada"}</strong> ({program.criteria?.secondary_weight ?? 0})
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50/80 border border-purple-100 px-2.5 py-1 text-purple-900 font-medium">
                        C3 Minat: <strong>{program.criteria?.interest_category?.name || "-"}</strong> ({program.criteria?.interest_weight})
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => startEdit(program)}
                    className="shrink-0 flex items-center gap-1.5 text-xs rounded-xl self-start"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
