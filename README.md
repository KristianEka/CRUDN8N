# Automation Penjualan × n8n

Aplikasi frontend berbasis React + Vite untuk mengelola data penjualan yang disimpan dan diotomasikan melalui workflow **n8n**. UI-nya menyediakan CRUD manual, upload batch CSV/XLSX, dan unduhan data langsung dari webhook n8n sehingga tim sales dapat bekerja tanpa perlu membuka n8n secara langsung.

## Fitur Utama
- **Dashboard responsif** dengan header bergaya marketplace dan aksi cepat untuk menambah data atau mengunggah file.
- **Form CRUD** (`src/components/SalesForm.tsx`) lengkap dengan validasi, kalkulasi otomatis `total_harga`, serta dukungan edit/delete melalui `SalesTable`.
- **Filter dan pencarian** pada tabel penjualan (tanggal, produk, pelanggan) berikut tombol refresh yang memanggil ulang webhook n8n.
- **Template & Upload**: generator template XLSX bawaan dan modal upload (`FileUpload`) dengan drag & drop, validasi tipe file, serta feedback sukses/gagal.
- **Download langsung dari n8n** (`DataDownload`) untuk CSV/XLSX menggunakan `URL.createObjectURL` sehingga file siap pakai di Excel/Sheets.
- **Notifikasi kontekstual** (`Notification`) untuk setiap aksi API agar pengguna tahu status integrasi n8n mereka.

## Teknologi
- [Vite](https://vitejs.dev/) + React 18 + TypeScript
- Tailwind CSS untuk styling dan `lucide-react` untuk ikon
- Native Fetch API + utilitas kustom (`src/utils/api.ts`, `src/utils/fileGenerator.ts`)
- Skrip eksperimen Node (`test-api.js`, `test-date.js`, `test-normalize.js`) untuk debugging cepat saat menyambungkan n8n

## Persyaratan
- Node.js 18 LTS atau lebih baru
- npm 9+ (atau pnpm/yarn bila disesuaikan sendiri)

## Menjalankan Proyek
```bash
npm install
cp .env.example .env   # jika belum ada, buat manual lihat bagian di bawah
npm run dev            # http://localhost:5173
```
Perintah lain:
- `npm run build` – bundel produksi ke `dist/`
- `npm run preview` – meninjau hasil build
- `npm run lint` – ESLint
- `npm run typecheck` – validasi tipe menggunakan `tsc --noEmit`

## Konfigurasi Lingkungan
Buat file `.env` dengan variabel berikut:
```ini
VITE_N8N_WEBHOOK_URL=https://example.com/webhook
```
- Nilai ini adalah **base URL** workflow n8n Anda (biasanya URL webhook Production atau Test).
- Aplikasi otomatis menghapus `/` di ujung URL agar path endpoint selalu konsisten.
- Setelah mengubah nilai, restart server dev agar Vite memuat ulang env.

## Kontrak API n8n
Seluruh request dibangun di `src/utils/api.ts`. Pastikan workflow n8n Anda mengekspos endpoint berikut di bawah `VITE_N8N_WEBHOOK_URL`:

| Endpoint relatif | Metode | Kegunaan | Catatan payload/respons |
|------------------|--------|----------|-------------------------|
| `GET /get-list`  | GET    | Mengambil seluruh data penjualan | Respons bisa array langsung atau objek `{ data: [...] }`. Data akan dinormalisasi di frontend. |
| `POST /add-data` | POST   | Menambah data baru | Body `application/x-www-form-urlencoded` dengan kunci `namaPelanggan`, `produk`, `qty`, `harga`, `totalHarga`, `tanggal`. |
| `PATCH /edit-data?id={id}` | PATCH | Mengubah baris tertentu | Body sama seperti tambah data. |
| `PATCH /delete-row?id={id}` | PATCH | Menandai/hapus data | Tidak perlu body. |
| `POST /send-file` | POST | Upload CSV/XLS/XLSX | Body `FormData` dengan field `file`. Harapkan respons `{ status: "success" }`. |
| `GET /get-file?format=csv|xlsx` | GET | Mengunduh data terbaru | Respons binary + header `Content-Disposition`. |

> **Tips:** simpan log setiap request di n8n agar mudah mendeteksi kesalahan 4xx/5xx yang kemudian diteruskan sebagai notifikasi error di UI.

## Format Data Penjualan
Aplikasi mengharapkan struktur berikut (lihat `src/types/index.ts`):
```ts
interface SalesData {
  id_transaksi: string;
  nama_pelanggan: string;
  produk: string;
  qty: number;
  harga: number;
  total_harga: number;
  tanggal: string; // format DD-MM-YYYY, YYYY-MM-DD, atau ISO
}
```
`api.ts` mempunyai utilitas penting:
- **Normalisasi angka**: menangani string berisi simbol mata uang, mengubahnya ke number.
- **Normalisasi tanggal**: menerima format `DD-MM-YY`, `YYYY-MM-DD`, ISO, bahkan serial Excel, lalu mengubahnya ke ISO agar konsisten di tabel/filter.
- **Fallback ID**: bila backend tidak mengirim `id_transaksi`, akan digantikan `row-{index}` agar React tidak kehilangan key.

## Alur Kerja UI Singkat
1. `App.tsx` memanggil `api.fetchSalesData()` saat mount dan menyimpan hasilnya di state.
2. Pengguna dapat:
   - Klik **Tambah Data Baru** → membuka `SalesForm` (modal). Submit akan memanggil `api.createSalesData` atau `api.updateSalesData` jika mode edit.
   - Klik ikon pensil / tempat sampah pada `SalesTable` untuk membuka modal edit/hapus (`DeleteConfirmation`).
   - Klik **Upload File CSV/XLSX** → membuka modal `FileUpload` dengan drag & drop. Berhasil upload akan menutup modal otomatis.
   - Mengunduh template atau data terbaru melalui komponen `TemplateDownload` dan `DataDownload`.
3. Semua keberhasilan/kesalahan akan muncul sebagai komponen `Notification` di kanan-bawah.

## Template & Upload
- Tombol **Download Template XLSX** membuat file mock dengan kolom lengkap melalui `generateTemplateXLSX` (tersimpan di `src/utils/fileGenerator.ts`). Format tab-delimited agar mudah diubah di Excel/Sheets.
- Modal upload menerima CSV, XLS, dan XLSX. Validasi dilakukan di sisi klien sebelum request dikirim.

## Struktur Proyek
```
src/
├─ App.tsx                # Komposisi halaman utama & state manajemen
├─ main.tsx, index.css    # Entry Vite + styling global/Tailwind
├─ components/            # Header, SalesTable, SalesForm, FileUpload, dst
├─ utils/
│   ├─ api.ts             # Abstraksi komunikasi webhook n8n + normalisasi data
│   └─ fileGenerator.ts   # Helper format mata uang/tanggal & generator template
└─ types/                 # Definisi TypeScript untuk SalesData dan state filter
```
File `test-*.js` di akar repo berguna untuk:
- Mengecek koneksi webhook (`test-api.js`)
- Memastikan formatter tanggal sesuai (`test-date.js`)
- Mensimulasikan normalisasi data mentah (`test-normalize.js`)
Jalankan dengan `node test-api.js` dan sesuaikan URL/env bila perlu.

## Deploy
1. Pastikan `VITE_N8N_WEBHOOK_URL` mengarah ke webhook Production.
2. `npm run build` → unggah isi folder `dist/` ke hosting static (Netlify, Vercel, Cloudflare Pages, dsb).
3. Aktifkan HTTPS agar fetch ke n8n tidak diblok oleh browser mixed-content.

## Troubleshooting
- **Notifikasi “Gagal memuat data penjualan”**: periksa apakah endpoint `get-list` tersedia dan mengembalikan JSON valid (gunakan `test-api.js` atau cURL).
- **Tanggal tampil aneh**: pastikan backend mengirim format konsisten; fungsi `formatDateForPayload` dan `formatDate` akan mencoba mengoreksi, tetapi data kosong tetap ditampilkan apa adanya.
- **Upload tidak jalan**: cek parameter `Binary Data` di workflow n8n serta batas ukuran file pada hosting Anda.

Dengan dokumentasi ini, setiap developer baru dapat memahami alur kerja aplikasi, menyiapkan environment, serta memastikan integrasi dengan workflow n8n berjalan mulus. Selamat membangun otomasi penjualan Anda! 🎯
