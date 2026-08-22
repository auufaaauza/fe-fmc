# Fitur Registrasi Siswa & Manajemen Sekolah (Final Plan)

## Arsitektur Role

| Role | Akses |
|------|-------|
| `superadmin` | Kelola semua sekolah, aktifkan/nonaktifkan admin (Guru BK), lihat semua data |
| `admin` (Guru BK) | Kelola siswa sekolahnya sendiri, tidak bisa manage sekolah lain |
| `student` (Siswa) | Akses fitur rekomendasi, daftar mandiri, pilih sekolah mitra |

## Alur Registrasi

```
Siswa mendaftar → pilih sekolah mitra → langsung aktif → bisa login
Admin (Guru BK) mendaftar → pilih sekolah → is_active = false → Superadmin aktifkan → bisa login
```

## Proposed Changes

---

### Backend (Laravel API)

#### [NEW] Migration: `create_schools_table`
```
id, name, npsn, address, city, province, is_active, timestamps
```

#### [MODIFY] Migration: `users` table (alter)
```
+ school_id (FK → schools, nullable — superadmin tidak perlu sekolah)
+ email (unique, nullable — sudah ada, tapi kini required untuk student)
```

#### [NEW] Model: `School`
- Relasi: `hasMany(User)`
- Fillable: `name`, `npsn`, `address`, `city`, `province`, `is_active`

#### [MODIFY] Model: `User`
- Tambah `school_id` ke `$fillable`
- Tambah relasi `belongsTo(School)`
- Enum role: `['superadmin', 'admin', 'student']`

#### [NEW] Seeder: `SchoolSeeder`
Seed 5–10 sekolah mitra contoh.

#### [MODIFY] `AuthController`
- Tambah `register()`:
  - **Student**: NIS + email + name + class + school_id + password → `is_active = true`
  - **Admin**: email + name + school_id + password → `is_active = false`

#### [NEW] `SchoolController`
- `GET /api/schools` — Publik (dropdown registrasi)
- `GET /api/superadmin/schools` — Superadmin only, list semua
- `POST /api/superadmin/schools` — Tambah sekolah
- `PUT /api/superadmin/schools/{id}` — Edit sekolah
- `DELETE /api/superadmin/schools/{id}` — Hapus sekolah

#### [MODIFY] `AdminController`
- Tambah scope `school_id` filter di `listStudents` (admin hanya lihat sekolahnya)
- Update `withStatus` sertakan nama sekolah

#### [NEW] `SuperAdminController`
- `GET /api/superadmin/admins` — List semua admin (aktif + pending)
- `PUT /api/superadmin/admins/{id}/activate` — Aktifkan admin
- `PUT /api/superadmin/admins/{id}/deactivate` — Nonaktifkan admin

#### [MODIFY] `Middleware/CheckRole`
- Update untuk support `superadmin`

#### [MODIFY] `api.php`
```php
Route::post('/register', [AuthController::class, 'register']); // public
Route::get('/schools', [SchoolController::class, 'publicList']); // public

Route::middleware('role:superadmin')->group(function() {
    Route::apiResource('/superadmin/schools', SchoolController::class);
    Route::get('/superadmin/admins', ...);
    Route::put('/superadmin/admins/{id}/activate', ...);
    Route::put('/superadmin/admins/{id}/deactivate', ...);
});
```

#### [MODIFY] `AuthController::login`
- Support role `superadmin` login via email

---

### Frontend (Next.js)

#### [MODIFY] `app/(auth)/login/page.tsx`
- Tambah tab `superadmin` atau link login superadmin
- Tambah link ke `/register`

#### [NEW] `app/(auth)/register/page.tsx`
Halaman register dengan 2 tab:

**Tab Siswa:**
- Nama Lengkap
- NIS
- Email
- Kelas (dropdown: X IPA / X IPS / XI IPA / XI IPS / XII IPA / XII IPS)
- Sekolah (dropdown dari `GET /api/schools`)
- Password + Konfirmasi

**Tab Admin (Guru BK):**
- Nama Lengkap
- Email
- Pilih Sekolah (dropdown)
- Password + Konfirmasi
- Badge info: "Akun akan diaktifkan oleh Superadmin"

#### [MODIFY] `app/(admin)/` layouts
- Sesuaikan sidebar untuk tampilkan nama sekolah admin

#### [NEW] `app/(superadmin)/` folder
- Layout superadmin dengan sidebar berbeda
- `app/(superadmin)/superadmin/dashboard/` — Dashboard superadmin
- `app/(superadmin)/superadmin/sekolah/` — CRUD sekolah mitra
- `app/(superadmin)/superadmin/admin/` — Kelola aktivasi Guru BK

#### [MODIFY] `types/index.ts`
- Tambah `School` interface
- Update `Role` = `"superadmin" | "admin" | "student"`
- Update `User` tambah `school_id`, `school`

#### [MODIFY] `context/AuthContext.tsx`
- Tambah `register()` method
- Update routing login berdasarkan role (superadmin → `/superadmin/dashboard`)

---

## Verification Plan

### Manual Verification
1. `GET /api/schools` → tampil daftar sekolah mitra
2. Register siswa → pilih sekolah → langsung bisa login
3. Register admin → muncul notif "menunggu verifikasi"
4. Login superadmin → aktifkan admin → admin bisa login
5. Admin login → hanya lihat siswa sekolahnya sendiri
6. Superadmin lihat semua sekolah dan semua admin
