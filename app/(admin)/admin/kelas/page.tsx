"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Edit2,
  Eye,
  Layers,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/axios";
import type { SchoolClass, StudentListItem } from "@/types";

export default function AdminKelasPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Class detail view states (when a class is clicked)
  const [selectedClassDetail, setSelectedClassDetail] = useState<SchoolClass | null>(null);
  const [classStudents, setClassStudents] = useState<StudentListItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formGrade, setFormGrade] = useState("XII");
  const [formIsActive, setFormIsActive] = useState(true);

  const { toast } = useToast();

  async function fetchClasses() {
    setLoading(true);
    try {
      const res = await api.get("/admin/classes", {
        params: { search: search || undefined },
      });
      setClasses(res.data.data || []);
    } catch (err: any) {
      toast({
        title: "Gagal memuat data kelas",
        description: err.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  // When a class is clicked, fetch all students belonging to that class
  async function handleSelectClass(cls: SchoolClass) {
    setSelectedClassDetail(cls);
    setLoadingStudents(true);
    try {
      const res = await api.get("/admin/students", {
        params: { class: cls.name },
      });
      setClassStudents(res.data.data || []);
    } catch (err: any) {
      toast({
        title: "Gagal memuat siswa kelas ini",
        description: err.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setLoadingStudents(false);
    }
  }

  function handleOpenCreate() {
    setEditingClass(null);
    setFormName("");
    setFormGrade("XII");
    setFormIsActive(true);
    setOpenModal(true);
  }

  function handleOpenEdit(e: React.MouseEvent, item: SchoolClass) {
    e.stopPropagation();
    setEditingClass(item);
    setFormName(item.name);
    setFormGrade(item.grade || "XII");
    setFormIsActive(item.is_active);
    setOpenModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formName,
      grade: formGrade || null,
      is_active: formIsActive,
    };

    try {
      if (editingClass) {
        await api.put(`/admin/classes/${editingClass.id}`, payload);
        toast({ title: "Kelas berhasil diperbarui", type: "success" });
      } else {
        await api.post("/admin/classes", payload);
        toast({ title: "Kelas baru berhasil ditambahkan", type: "success" });
      }
      setOpenModal(false);
      fetchClasses();
      if (selectedClassDetail && editingClass?.id === selectedClassDetail.id) {
        setSelectedClassDetail({ ...selectedClassDetail, name: formName });
      }
    } catch (err: any) {
      toast({
        title: "Gagal menyimpan kelas",
        description: err.appMessage || err.response?.data?.message || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, item: SchoolClass) {
    e.stopPropagation();
    if (!confirm(`Yakin ingin menghapus kelas "${item.name}"?`)) return;

    try {
      await api.delete(`/admin/classes/${item.id}`);
      toast({ title: "Kelas berhasil dihapus", type: "success" });
      if (selectedClassDetail?.id === item.id) {
        setSelectedClassDetail(null);
      }
      fetchClasses();
    } catch (err: any) {
      toast({
        title: "Gagal menghapus kelas",
        description: err.appMessage || err.response?.data?.message || "Masih ada siswa di kelas ini.",
        type: "error",
      });
    }
  }

  const filteredClassStudents = classStudents.filter((st) =>
    `${st.nisn} ${st.name} ${st.email || ""}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── VIEW 1: Detail Siswa per Kelas yang di-klik ── */}
      {selectedClassDetail ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b-4 border-black pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => setSelectedClassDetail(null)}
                className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase text-pink-600 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Semua Kelas
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tight">
                  Siswa Kelas {selectedClassDetail.name}
                </h1>
                <span className="nb-badge bg-yellow-300">
                  {classStudents.length} Siswa Terdaftar
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setSelectedClassDetail(null)}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" /> Lihat Kelas Lain
            </Button>
          </div>

          {/* Search bar for students in this class */}
          <div className="relative">
            <Input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Cari siswa berdasarkan NISN atau Nama di kelas ini..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          </div>

          {/* Table Students in this class */}
          {loadingStudents ? (
            <LoadingSpinner />
          ) : classStudents.length === 0 ? (
            <div className="nb-card p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 font-black text-gray-700">
                Belum ada siswa yang terdaftar di kelas {selectedClassDetail.name}.
              </p>
              <p className="text-sm text-gray-500">
                Siswa yang memilih kelas ini saat registrasi akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="nb-card overflow-x-auto">
              <table className="nb-table w-full border-collapse bg-white">
                <thead>
                  <tr>
                    <th>NISN</th>
                    <th>Nama Siswa</th>
                    <th>Email</th>
                    <th>Status Rapor</th>
                    <th>Status Kuesioner</th>
                    <th>Status Rekomendasi</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassStudents.map((st) => (
                    <tr key={st.id}>
                      <td className="font-mono text-sm font-black">{st.nisn}</td>
                      <td>
                        <p className="font-black text-black">{st.name}</p>
                      </td>
                      <td className="text-sm text-gray-600">{st.email || "-"}</td>
                      <td>
                        {st.rapor_complete ? (
                          <span className="nb-badge bg-green-300">Lengkap</span>
                        ) : (
                          <span className="nb-badge bg-gray-200 text-gray-700">Belum</span>
                        )}
                      </td>
                      <td>
                        {st.questionnaire_complete ? (
                          <span className="nb-badge bg-green-300">Lengkap</span>
                        ) : (
                          <span className="nb-badge bg-gray-200 text-gray-700">Belum</span>
                        )}
                      </td>
                      <td>
                        {st.recommendation_complete ? (
                          <span className="nb-badge bg-purple-300">Ada</span>
                        ) : (
                          <span className="nb-badge bg-gray-200 text-gray-700">Belum</span>
                        )}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/admin/siswa/${st.id}`}
                          className="nb-btn-primary inline-flex items-center gap-1.5 px-3 py-1 text-xs"
                          title="Lihat Rapor, Kuesioner, & Rekomendasi"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Lihat Detail Siswa
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── VIEW 2: Daftar Semua Kelas Sekolah ── */
        <div className="space-y-6">
          <div className="flex flex-col gap-4 border-b-4 border-black pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">
                Kelola Kelas & Data Siswa
              </h1>
              <p className="font-bold text-gray-700">
                Klik pada salah satu kelas di bawah untuk melihat seluruh data siswa di kelas tersebut.
              </p>
            </div>
            <Button onClick={handleOpenCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Tambah Kelas Baru
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-80">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchClasses()}
                placeholder="Cari nama kelas (misal: XII IPA 1)..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            </div>
            <Button variant="outline" onClick={fetchClasses}>
              Cari
            </Button>
          </div>

          {/* Table List of Classes */}
          {loading ? (
            <LoadingSpinner />
          ) : classes.length === 0 ? (
            <div className="nb-card p-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 font-black text-gray-700">Belum ada kelas yang didaftarkan.</p>
              <p className="text-sm text-gray-500">
                Tambahkan kelas agar calon siswa dapat memilih kelasnya saat registrasi.
              </p>
              <Button onClick={handleOpenCreate} className="mt-4">
                Tambah Kelas Pertama
              </Button>
            </div>
          ) : (
            <div className="nb-card overflow-x-auto">
              <table className="nb-table w-full">
                <thead>
                  <tr>
                    <th>Nama Kelas</th>
                    <th>Tingkat</th>
                    <th className="text-center">Jumlah Siswa</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr
                      key={cls.id}
                      onClick={() => handleSelectClass(cls)}
                      className="cursor-pointer transition-colors hover:bg-yellow-100"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-pink-600" />
                          <span className="font-black text-black hover:underline">
                            {cls.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="nb-badge bg-yellow-300">
                          Kelas {cls.grade || "-"}
                        </span>
                      </td>
                      <td className="text-center font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-600" />
                          {cls.students_count ?? 0} Siswa
                        </span>
                      </td>
                      <td className="text-center">
                        {cls.is_active ? (
                          <span className="nb-badge bg-green-300">Aktif</span>
                        ) : (
                          <span className="nb-badge bg-gray-300 text-gray-700">Nonaktif</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div
                          className="flex justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            onClick={() => handleSelectClass(cls)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Buka Siswa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleOpenEdit(e, cls)}
                            className="p-2"
                            title="Edit Kelas"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => handleDelete(e, cls)}
                            className="p-2"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah / Edit Kelas */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Edit Kelas" : "Tambah Kelas Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-black">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: XII IPA 1 / XII MIPA 2 / X-1"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-black">Tingkat</label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                className="nb-input"
              >
                <option value="XII">Kelas XII (12)</option>
                <option value="XI">Kelas XI (11)</option>
                <option value="X">Kelas X (10)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="class_is_active"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 border-2 border-black accent-yellow-400"
              />
              <label htmlFor="class_is_active" className="text-sm font-black">
                Kelas Aktif (Muncul di formulir pendaftaran siswa)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Kelas"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
