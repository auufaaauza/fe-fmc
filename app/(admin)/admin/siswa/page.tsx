"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  Edit,
  Eye,
  KeyRound,
  Layers,
  Plus,
  Trash2,
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
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

// ── Import Result Types ───────────────────────────────────────────────────────

interface ImportResultRow {
  nisn: string;
  name: string;
  action: string;
  scores: number;
}

interface ImportSummary {
  total_processed: number;
  total_errors: number;
}

// ── Main Component ────────────────────────────────────────────────────────────

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

  // Import modal state
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
    return students.filter((student) => {
      const matchesSearch = `${student.nisn} ${student.name} ${student.class ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesClass = selectedClass ? student.class === selectedClass : true;
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
      toast({
        title: "Gagal memuat data",
        description: error.appMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(student: StudentListItem) {
    setEditing(student);
    setForm({
      name: student.name,
      nisn: student.nisn,
      class: student.class ?? "",
      password: "",
      is_active: student.is_active,
    });
    setOpen(true);
  }

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      toast({ title: "Gagal menyimpan siswa", description: error.appMessage, type: "error" });
    }
  }

  async function deleteStudent(student: StudentListItem) {
    if (!window.confirm(`Hapus siswa ${student.name}?`)) return;
    try {
      await api.delete(`/admin/students/${student.id}`);
      toast({ title: "Berhasil", description: "Siswa dihapus.", type: "success" });
      await loadData();
    } catch (error: any) {
      toast({ title: "Gagal menghapus siswa", description: error.appMessage, type: "error" });
    }
  }

  async function resetPassword(student: StudentListItem) {
    if (
      !window.confirm(
        `Reset password untuk ${student.name} (NISN: ${student.nisn}) menjadi 'siswa123'?`
      )
    )
      return;
    try {
      const res = await api.post(`/admin/students/${student.id}/reset-password`);
      toast({
        title: "Password Direset",
        description: res.data.message || "Password direset ke siswa123",
        type: "success",
      });
    } catch (error: any) {
      toast({
        title: "Gagal reset password",
        description: error.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────────

  async function handleExport() {
    setExporting(true);
    try {
      const response = await api.get("/admin/students/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"] || "";
      const match = contentDisposition.match(/filename="?(.+)"?/);
      link.download = match ? match[1] : "data-siswa-nilai.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Export Berhasil", description: "File Excel berhasil diunduh.", type: "success" });
    } catch (error: any) {
      toast({ title: "Gagal export", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      const response = await api.get("/admin/students/import-template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "template-import-siswa.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Gagal", description: "Gagal mengunduh template.", type: "error" });
    }
  }

  // ── Import ────────────────────────────────────────────────────────────────────

  function openImportModal() {
    setImportFile(null);
    setImportDone(false);
    setImportResults([]);
    setImportErrors([]);
    setImportSummary(null);
    setImportOpen(true);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setImportFile(file);
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await api.post("/admin/students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResults(res.data.results || []);
      setImportErrors(res.data.errors || []);
      setImportSummary(res.data.summary || null);
      setImportDone(true);
      await loadData();
      toast({
        title: "Import Selesai",
        description: `${res.data.summary?.total_processed ?? 0} siswa diproses.`,
        type: "success",
      });
    } catch (error: any) {
      toast({ title: "Gagal import", description: error.appMessage || "File tidak valid.", type: "error" });
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Data Siswa"
        action={
          <div className="flex flex-wrap gap-2">
            {/* Kelola Kelas */}
            <Link href="/admin/kelas">
              <Button variant="outline" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Kelola Kelas
              </Button>
            </Link>

            {/* Export Button */}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50"
              onClick={handleExport}
              disabled={exporting}
              id="btn-export-siswa"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "Mengunduh..." : "Export Excel"}
            </Button>

            {/* Import Button */}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
              onClick={openImportModal}
              id="btn-import-siswa"
            >
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>

            {/* Tambah Siswa */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={startCreate} className="flex items-center gap-2" id="btn-tambah-siswa">
                  <Plus className="h-4 w-4" />
                  Tambah Siswa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={saveStudent} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-black">Nama Lengkap</label>
                    <Input
                      placeholder="Nama Lengkap Siswa"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-black">NISN</label>
                    <Input
                      placeholder="Nomor Induk Siswa Nasional"
                      value={form.nisn}
                      onChange={(event) => setForm({ ...form, nisn: event.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-black">Kelas</label>
                    {classes.length > 0 ? (
                      <select
                        value={form.class}
                        onChange={(e) => setForm({ ...form, class: e.target.value })}
                        className="nb-input"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Contoh: XII IPA 1"
                        value={form.class}
                        onChange={(event) => setForm({ ...form, class: event.target.value })}
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-black">
                      {editing ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                    </label>
                    <Input
                      placeholder={editing ? "Password baru (opsional)" : "Password"}
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      required={!editing}
                    />
                  </div>

                  <label className="flex items-center gap-3 font-black">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                      className="h-4 w-4 border-2 border-black accent-yellow-400"
                    />
                    Akun Siswa Aktif
                  </label>

                  <Button type="submit" className="w-full">
                    Simpan Data Siswa
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-black uppercase text-gray-600">Filter Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="nb-input"
          >
            <option value="">-- Semua Kelas ({students.length} Siswa) --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-black uppercase text-gray-600">Pencarian Siswa</label>
          <Input
            placeholder="Cari berdasarkan NIS, nama, atau kelas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="nb-card overflow-x-auto">
        <table className="nb-table w-full border-collapse bg-white">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Status Rapor</th>
              <th>Status Kuesioner</th>
              <th>Status Rekomendasi</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center font-black text-gray-500">
                  Tidak ada data siswa yang cocok dengan kriteria filter/pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student.id}>
                  <td className="font-mono text-sm font-black">{student.nisn}</td>
                  <td>
                    <p className="font-black text-black">{student.name}</p>
                    {student.email && <p className="text-xs text-gray-500">{student.email}</p>}
                  </td>
                  <td>
                    <span className="nb-badge bg-yellow-300">{student.class ?? "-"}</span>
                  </td>
                  <td>
                    {student.rapor_complete ? (
                      <span className="nb-badge bg-green-300">Lengkap</span>
                    ) : (
                      <span className="nb-badge bg-gray-200 text-gray-700">Belum</span>
                    )}
                  </td>
                  <td>
                    {student.questionnaire_complete ? (
                      <span className="nb-badge bg-green-300">Lengkap</span>
                    ) : (
                      <span className="nb-badge bg-gray-200 text-gray-700">Belum</span>
                    )}
                  </td>
                  <td>
                    {student.recommendation_complete ? (
                      <span className="nb-badge bg-purple-300">Ada</span>
                    ) : (
                      <span className="nb-badge bg-gray-200 text-gray-700">Belum</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="border-2 border-black bg-blue-300 p-2 hover:bg-blue-400"
                        onClick={() => resetPassword(student)}
                        title="Reset Password ke siswa123"
                      >
                        <KeyRound className="h-4 w-4 text-blue-950" />
                      </button>
                      <button
                        className="border-2 border-black bg-yellow-300 p-2 hover:bg-yellow-400"
                        onClick={() => startEdit(student)}
                        title="Edit Siswa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="border-2 border-black bg-red-300 p-2 hover:bg-red-400"
                        onClick={() => deleteStudent(student)}
                        title="Hapus Siswa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        className="border-2 border-black bg-white p-2 hover:bg-gray-100"
                        href={`/admin/siswa/${student.id}`}
                        title="Lihat Detail & Rekomendasi"
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

      {/* ── Import Modal ───────────────────────────────────────────────────────── */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Import Data Siswa dari Excel
            </DialogTitle>
          </DialogHeader>

          {!importDone ? (
            <div className="space-y-4">
              {/* Step 1: Download Template */}
              <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="mb-2 text-sm font-black text-gray-700">
                  Langkah 1: Unduh template Excel, isi data siswa dan nilai, lalu upload kembali.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 border-2 border-black bg-purple-200 px-3 py-1.5 text-xs font-black hover:bg-purple-300"
                  id="btn-download-template"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh Template (.xlsx)
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div>
                <p className="mb-2 text-sm font-black text-gray-700">
                  Langkah 2: Upload file Excel yang sudah diisi.
                </p>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-400 bg-blue-50 p-6 transition-colors hover:bg-blue-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-blue-500" />
                  {importFile ? (
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-black text-green-700">{importFile.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-black text-blue-700">Klik untuk pilih file Excel</p>
                      <p className="text-xs text-gray-500">Format: .xlsx atau .xls (Maks. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="input-import-file"
                />
              </div>

              {/* Catatan */}
              <div className="border-2 border-amber-400 bg-amber-50 p-3 text-xs font-bold text-amber-900">
                <p className="mb-1">📌 Ketentuan Import:</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  <li>Siswa dengan NIS yang sudah ada akan diperbarui datanya</li>
                  <li>Siswa baru (NIS belum terdaftar) otomatis dibuat, password default: <code className="bg-amber-200 px-1">siswa123</code></li>
                  <li>Nilai yang diisi adalah nilai rata-rata rapor (0–100)</li>
                  <li>Kolom yang tidak diisi akan diabaikan</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  id="btn-proses-import"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Proses Import
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImportOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            /* Import Result */
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-green-500 bg-green-50 p-3 text-center">
                  <p className="text-2xl font-black text-green-700">{importSummary?.total_processed ?? 0}</p>
                  <p className="text-xs font-bold text-green-600">Siswa Diproses</p>
                </div>
                <div className={`border-2 p-3 text-center ${importErrors.length > 0 ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"}`}>
                  <p className={`text-2xl font-black ${importErrors.length > 0 ? "text-red-700" : "text-gray-500"}`}>{importSummary?.total_errors ?? 0}</p>
                  <p className={`text-xs font-bold ${importErrors.length > 0 ? "text-red-600" : "text-gray-500"}`}>Error</p>
                </div>
              </div>

              {/* Results Table */}
              {importResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto border-2 border-black">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1 text-left font-black">NIS</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-black">Nama</th>
                        <th className="border border-gray-300 px-2 py-1 font-black">Status</th>
                        <th className="border border-gray-300 px-2 py-1 font-black">Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.map((row, i) => (
                        <tr key={i} className="odd:bg-white even:bg-gray-50">
                          <td className="border border-gray-200 px-2 py-1 font-mono">{row.nisn}</td>
                          <td className="border border-gray-200 px-2 py-1">{row.name}</td>
                          <td className="border border-gray-200 px-2 py-1 text-center">
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold ${row.action === "dibuat baru" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                              {row.action === "dibuat baru" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {row.action}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-2 py-1 text-center font-black">{row.scores} mapel</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="max-h-32 overflow-y-auto border-2 border-red-400 bg-red-50 p-3">
                  <p className="mb-1 text-xs font-black text-red-700 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Pesan Error:
                  </p>
                  {importErrors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600">• {err}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setImportDone(false);
                    setImportFile(null);
                    setImportResults([]);
                    setImportErrors([]);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Import Lagi
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setImportOpen(false)}
                >
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
