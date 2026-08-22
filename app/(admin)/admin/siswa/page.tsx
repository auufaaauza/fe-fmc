"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  KeyRound,
  Layers,
  Loader2,
  Plus,
  ShieldCheck,
  Clock,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { SchoolClass, StudentListItem } from "@/types";
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

const emptyForm = { name: "", nisn: "", class: "", password: "", is_active: true };

interface ImportResultRow { nisn: string; name: string; action: string; scores: number; }
interface ImportSummary { total_processed: number; total_errors: number; }

export default function AdminSiswaPage() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudentListItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importResults, setImportResults] = useState<ImportResultRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = `${s.nisn} ${s.name} ${s.class ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesClass = selectedClass ? s.class === selectedClass : true;
      return matchesSearch && matchesClass;
    });
  }, [students, search, selectedClass]);

  async function loadData() {
    try {
      const [resStudents, resClasses] = await Promise.all([
        api.get("/admin/students"),
        api.get("/admin/classes"),
      ]);
      setStudents(resStudents.data.data || []);
      setClasses(resClasses.data.data || []);
    } catch (error: any) {
      toast({ title: "Gagal memuat data", description: error.appMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function startCreate() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function startEdit(student: StudentListItem) {
    setEditing(student);
    setForm({ name: student.name, nisn: student.nisn, class: student.class ?? "", password: "", is_active: student.is_active });
    setOpen(true);
  }

  async function saveStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/students/${editing.id}`, form);
        toast({ title: "Berhasil", description: "Data siswa diperbarui.", type: "success" });
      } else {
        await api.post("/admin/students", form);
        toast({ title: "Berhasil", description: "Siswa ditambahkan.", type: "success" });
      }
      setOpen(false);
      await loadData();
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.appMessage, type: "error" });
    }
  }

  async function deleteStudent(student: StudentListItem) {
    if (!window.confirm(`Hapus siswa ${student.name}?`)) return;
    try {
      await api.delete(`/admin/students/${student.id}`);
      toast({ title: "Berhasil", description: "Siswa dihapus.", type: "success" });
      await loadData();
    } catch (error: any) {
      toast({ title: "Gagal menghapus", description: error.appMessage, type: "error" });
    }
  }

  async function resetPassword(student: StudentListItem) {
    if (!window.confirm(`Reset password ${student.name} (${student.nisn}) menjadi 'siswa123'?`)) return;
    try {
      const res = await api.post(`/admin/students/${student.id}/reset-password`);
      toast({ title: "Password Direset", description: res.data.message || "Password direset ke siswa123", type: "success" });
    } catch (error: any) {
      toast({ title: "Gagal reset password", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await api.get("/admin/students/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const cd = response.headers["content-disposition"] || "";
      const match = cd.match(/filename="?(.+)"?/);
      link.download = match ? match[1] : "data-siswa-nilai.xlsx";
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Export Berhasil", description: "File Excel berhasil diunduh.", type: "success" });
    } catch (error: any) {
      toast({ title: "Gagal export", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
    } finally { setExporting(false); }
  }

  async function handleDownloadTemplate() {
    try {
      const response = await api.get("/admin/students/import-template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url; link.download = "template-import-siswa.xlsx";
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast({ title: "Gagal", description: "Gagal mengunduh template.", type: "error" }); }
  }

  function openImportModal() {
    setImportFile(null); setImportDone(false); setImportResults([]);
    setImportErrors([]); setImportSummary(null); setImportOpen(true);
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await api.post("/admin/students/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setImportResults(res.data.results || []);
      setImportErrors(res.data.errors || []);
      setImportSummary(res.data.summary || null);
      setImportDone(true);
      await loadData();
      toast({ title: "Import Selesai", description: `${res.data.summary?.total_processed ?? 0} siswa diproses.`, type: "success" });
    } catch (error: any) {
      toast({ title: "Gagal import", description: error.appMessage || "File tidak valid.", type: "error" });
    } finally { setImporting(false); }
  }

  if (loading) return <LoadingSpinner />;

  const StatusBadge = ({ ok, okLabel = "Lengkap", noLabel = "Belum" }: { ok: boolean; okLabel?: string; noLabel?: string }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      ok ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
    }`}>
      {ok ? okLabel : noLabel}
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Data Siswa"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/kelas">
              <Button variant="glass" className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Kelola Kelas
              </Button>
            </Link>

            <Button variant="glass" onClick={handleExport} disabled={exporting} id="btn-export-siswa"
              className="flex items-center gap-2 text-emerald-700 border-emerald-200">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Mengunduh..." : "Export Excel"}
            </Button>

            <Button variant="glass" onClick={openImportModal} id="btn-import-siswa"
              className="flex items-center gap-2 text-blue-700 border-blue-200">
              <Upload className="h-4 w-4" /> Import Excel
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={startCreate} className="flex items-center gap-2" id="btn-tambah-siswa">
                  <Plus className="h-4 w-4" /> Tambah Siswa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={saveStudent} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap</label>
                    <Input placeholder="Nama Lengkap Siswa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">NISN</label>
                    <Input placeholder="Nomor Induk Siswa Nasional" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kelas</label>
                    {classes.length > 0 ? (
                      <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="nb-input">
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    ) : (
                      <Input placeholder="Contoh: XII IPA 1" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {editing ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                    </label>
                    <Input placeholder={editing ? "Password baru (opsional)" : "Password"} type="password"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Akun Siswa Aktif
                  </label>
                  <Button type="submit" className="w-full">Simpan Data Siswa</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filter & Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide">Filter Kelas</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="nb-input">
            <option value="">-- Semua Kelas ({students.length} Siswa) --</option>
            {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide">Pencarian Siswa</label>
          <Input placeholder="Cari berdasarkan NIS, nama, atau kelas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="nb-card overflow-x-auto">
        <table className="nb-table w-full">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Rapor</th>
              <th>Kuesioner</th>
              <th>Rekomendasi</th>
              <th>Validasi</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Tidak ada data siswa yang cocok dengan kriteria.
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student.id}>
                  <td className="font-mono text-xs text-slate-600">{student.nisn}</td>
                  <td>
                    <p className="font-medium text-slate-900">{student.name}</p>
                    {student.email && <p className="text-xs text-slate-400">{student.email}</p>}
                  </td>
                  <td>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {student.class ?? "-"}
                    </span>
                  </td>
                  <td><StatusBadge ok={student.rapor_complete} /></td>
                  <td><StatusBadge ok={student.questionnaire_complete} /></td>
                  <td><StatusBadge ok={student.recommendation_complete} okLabel="Ada" noLabel="Belum" /></td>
                  <td>
                    {student.recommendation_complete ? (
                      student.is_validated ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          <ShieldCheck className="h-3 w-3" /> Tervalidasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => resetPassword(student)} title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => startEdit(student)} title="Edit Siswa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => deleteStudent(student)} title="Hapus Siswa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        href={`/admin/siswa/${student.id}`} title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
              Import Data Siswa dari Excel
            </DialogTitle>
          </DialogHeader>

          {!importDone ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Langkah 1: Unduh template Excel, isi data siswa dan nilai, lalu upload kembali.
                </p>
                <button onClick={handleDownloadTemplate} id="btn-download-template"
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200 transition-colors">
                  <Download className="h-3.5 w-3.5" /> Unduh Template (.xlsx)
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Langkah 2: Upload file Excel yang sudah diisi.</p>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-slate-400" />
                  {importFile ? (
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{importFile.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-600">Klik untuk pilih file Excel</p>
                      <p className="text-xs text-slate-400">Format: .xlsx atau .xls (Maks. 5MB)</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="hidden" id="input-import-file" />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <p className="font-semibold mb-1">Ketentuan Import:</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  <li>Siswa dengan NIS yang sudah ada akan diperbarui datanya</li>
                  <li>Siswa baru otomatis dibuat, password default: <code className="bg-amber-200 px-1 rounded">siswa123</code></li>
                  <li>Nilai yang diisi adalah nilai rata-rata rapor (0-100)</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleImport}
                  disabled={!importFile || importing} id="btn-proses-import">
                  {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : <><Upload className="h-4 w-4" /> Proses Import</>}
                </Button>
                <Button variant="plain" onClick={() => setImportOpen(false)}>Batal</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                  <p className="text-2xl font-semibold text-green-700">{importSummary?.total_processed ?? 0}</p>
                  <p className="text-xs text-green-600 mt-1">Siswa Diproses</p>
                </div>
                <div className={`rounded-xl p-4 text-center border ${importErrors.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                  <p className={`text-2xl font-semibold ${importErrors.length > 0 ? "text-red-700" : "text-slate-500"}`}>{importSummary?.total_errors ?? 0}</p>
                  <p className={`text-xs mt-1 ${importErrors.length > 0 ? "text-red-600" : "text-slate-400"}`}>Error</p>
                </div>
              </div>

              {importResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">NIS</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">Nama</th>
                        <th className="px-3 py-2 text-center font-medium text-slate-500">Status</th>
                        <th className="px-3 py-2 text-center font-medium text-slate-500">Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono">{row.nisn}</td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${row.action === "dibuat baru" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                              <CheckCircle2 className="h-3 w-3" /> {row.action}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center font-medium">{row.scores} mapel</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {importErrors.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-red-700">
                    <AlertCircle className="h-3.5 w-3.5" /> Pesan Error:
                  </p>
                  {importErrors.map((err, i) => <p key={i} className="text-xs text-red-600">- {err}</p>)}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="plain" className="flex-1"
                  onClick={() => { setImportDone(false); setImportFile(null); setImportResults([]); setImportErrors([]); }}>
                  Import Lagi
                </Button>
                <Button className="flex-1" onClick={() => setImportOpen(false)}>Selesai</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
