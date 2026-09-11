Backend Dan Database Sistem

Arsitektur Backend
Backend BaktiNusantara dibangun menggunakan Laravel (PHP) sebagai framework utama, dipadukan dengan MySQL sebagai sistem manajemen basis data.
Alasan pemilihan Laravel:
Eloquent ORM mempermudah pemodelan relasi antar entitas yang kompleks pada sistem ini — misalnya relasi antara Kelompok Mahasiswa, Proposal, Pos Kebutuhan, dan Profil Desa yang saling terhubung (lihat Tata Kelola Tripartit, tab Proposal).
Built-in Authentication & Middleware Laravel sangat cocok untuk implementasi Role-Based Access Control (RBAC) empat peran (Masyarakat, Perangkat Desa, Mahasiswa, Universitas/DPL) yang menjadi kebutuhan inti sistem (lihat CORE FEATURES → RBAC & Verifikasi Identitas).
Ekosistem package matang mendukung fitur turunan seperti autentikasi API (Sanctum), penyimpanan file (untuk unggahan SK Desa, KTM, foto bukti aspirasi), dan job scheduling (untuk deadline otomatis pengajuan KKN).
Alasan pemilihan MySQL:
Bersifat open-source, banyak didukung hosting, dan familiar untuk tim pengembang.
Cukup andal untuk struktur data relasional
Mendukung foreign key constraint dan indexing yang diperlukan untuk menjaga integritas data antar-role (misalnya constraint 1 mahasiswa hanya boleh tergabung dalam 1 kelompok).

1.2 Struktur Backend
Pakai MVC standar Laravel + tambahin Service layer:
Controller  → terima request, validasi input (FormRequest), panggil Service
Service     → logic bisnis (Haversine, matching score, approve/reject, dsb)
Model       → Eloquent, representasi tabel
Repository layer opsional — kalau tim kecil dan waktu mepet, skip aja, langsung Service manggil Model.

1.3 Alur request-response (contoh: mahasiswa apply proposal)
Client (POST /api/proposal) 
  → Route 
  → Middleware (cek token + role = mahasiswa) 
  → ProposalController@store (validasi input) 
  → ProposalService::createProposal() 
      - cek kuota pos_kebutuhan masih ada
      - hitung matching_score (jurusan vs kebutuhan)
      - hitung jarak (Haversine) buat cek radius
  → Model simpan ke DB (MySQL) 
  → Controller return JSON response

Desain Database
2.1 Tabel ERD Database
















2.1 Entity utama database

Entitas
Fungsi
Key Field
Relasi
users
Tabel induk semua akun (semua role login lewat sini)
role, is_verified
induk profil_mahasiswa, profil_desa, profil_universitas, profil_dosen, kelompok
kelompok + anggota_kelompok
Data kelompok mahasiswa dan anggotanya
ketua_id, dosen_id, jurusan_kontribusi
Ke users; ke profil_dosen; dipakai di proposal
profil_desa
Data desa terverifikasi (yang jadi host KKN)
latitude/longitude, sk_file_url
Induk aspirasi, pos_kebutuhan, laporan_dosen
profil_universitas
Data institusi kampus (akun admin universitas yang mengelola dosen)
kode_univ, verified_at
Induk profil_dosen
profil_dosen
Data dosen pendamping (DPL) yang ditambahkan admin universitas
nip, universitas_id, ditambahkan_oleh
Ke profil_universitas; dipakai di kelompok, laporan_dosen
aspirasi
Laporan kebutuhan dari masyarakat (belum resmi)
status, urgensi
cikal-bakal pos_kebutuhan
pos_kebutuhan
Kebutuhan resmi yang sudah dikurasi desa, siap dilamar
kuota_kelompok, deadline, jurusan_dibutuhkan
Relasi many-to-many ke sdg_tags
proposal
Pengajuan kelompok mahasiswa ke satu pos kebutuhan
matching_score, jarak_km, status
Penghubung kelompok ↔ pos_kebutuhan
progress_mingguan
Laporan progres KKN per minggu
is_locked, persentase
Anak dari proposal
luaran_akhir
Hasil kerja final yang disahkan desa
status_verifikasi, disahkan_oleh
1-1 dengan proposal
portofolio_publik
Halaman publik hasil KKN yang bisa dibagikan
slug_public
1-1 dengan luaran_akhir
laporan_dosen
Laporan dari desa mengenai kinerja/kendala dosen pendamping tertentu, ditinjau admin universitas
status, isi
Ke profil_dosen, profil_desa; opsional ke proposal


BAB 3 — Role-Based Access Control & Autentikasi
3.1 Skema Role & Hak Akses
Role
Login
Diverifikasi oleh
Hak Akses Utama
Masyarakat
Tidak wajib
Verifikasi kontak sederhana saat submit (bukan verifikasi akun)
Submit aspirasi, lihat katalog publik, cek status pengajuan via nomor tiket/WA
Mahasiswa
Wajib
Verifikasi akademik (NIM + KTM)
Buat/join kelompok, eksplorasi pos kebutuhan, submit proposal, upload progress mingguan, klaim portofolio
Perangkat Desa
Wajib
Verifikasi SK Pengangkatan/kontak resmi desa
Kurasi aspirasi, publish pos_kebutuhan, approve/reject proposal, sahkan luaran akhir
Universitas
Wajib
Verifikasi institusi (kode resmi kampus)
Kelola data dosen (tambah/nonaktifkan), tinjau laporan_dosen, monitoring agregat kelompok binaan
Dosen (DPL)
Wajib
Ditambahkan oleh admin Universitas (bukan self-register)
Approve kelayakan draf proposal kelompok binaan, monitoring progress, download laporan akhir

Referensi: skema 4+1 aktor ini gabungan dari Tata Kelola Tripartit (tab Proposal) + 
3.2 Middleware & Guard per Rolerevisi "Roles ditambahin roles universitas" (tab Backend dan Database, Revisi 1 September).
Route::middleware(['auth:sanctum', 'role:mahasiswa'])->group(function () {
    Route::post('/proposal', [ProposalController::class, 'store']);
    Route::post('/progress', [ProgressController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:perangkat_desa'])->group(function () {
    Route::patch('/aspirasi/{id}/verify', [AspirasiController::class, 'verify']);
    Route::patch('/proposal/{id}/decide', [ProposalController::class, 'decide']);
});

Route::middleware(['auth:sanctum', 'role:dosen'])->group(function () {
    Route::patch('/proposal/{id}/kelayakan', [ProposalController::class, 'validasiKelayakan']);
});

Route::middleware(['auth:sanctum', 'role:universitas'])->group(function () {
    Route::post('/dosen', [DosenController::class, 'store']);
    Route::get('/laporan-dosen', [LaporanDosenController::class, 'index']);
});
Endpoint aspirasi (submit dari masyarakat) sengaja tanpa middleware auth — sesuai Batasan Sistem no. 3: "Masyarakat tidak wajib login atau membuat akun."
Scope check tambahan di Service layer:
// Dosen cuma boleh akses kelompok binaannya sendiri
if ($kelompok->dosen_id !== auth()->user()->profilDosen->id) {
    abort(403);
}

// Perangkat desa cuma boleh proses proposal yang masuk ke desanya sendiri
if ($proposal->posKebutuhan->desa_id !== auth()->user()->profilDesa->id) {
    abort(403);
}
3.3 Proses Verifikasi Identitas per Role
Role
Dokumen/Data
Alur Verifikasi
Mahasiswa
NIM, KTM (upload file)
Daftar → upload KTM → is_verified = false → sistem/admin cek kecocokan NIM-nama-KTM → verified_at diisi. Ketua kelompok tervalidasi dulu sebelum bisa create kelompok.
Perangkat Desa
SK Pengangkatan / kontak resmi desa (upload file)
Daftar → upload SK → status pending → tinjauan manual (belum ada API resmi cek keabsahan SK ke Kemendagri, jadi verifikasi manual oleh admin platform di MVP) → verified_at diisi baru bisa publish pos_kebutuhan
Universitas
Kode institusi resmi / surat penunjukan admin
Daftar institusi → verifikasi manual admin platform (skala kecil dulu sesuai Batasan Sistem no. 7: MVP dengan universitas terbatas)
Dosen
Tidak self-register
Dibuat oleh admin Universitas yang sudah terverifikasi → sistem generate akun + invite (email set password) → dosen login pertama kali lengkapi profil (nip, dll)
Masyarakat
Nama + no. WhatsApp aktif
Bukan verifikasi akun formal — cukup cek nomor WA valid (opsional kirim OTP) saat submit aspirasi, buat kebutuhan tracking status via WA


BAB 4 — Modul & Alur Fungsional
4.1 Modul Aspirasi Masyarakat
Endpoint:
POST   /api/aspirasi          (public, no auth)
GET    /api/aspirasi/{ticket}  (cek status via nomor tiket, no auth)
Flow:
Masyarakat isi form (kategori, deskripsi, pin lokasi, urgensi, foto, nama+WA)
  → AspirasiController@store
  → AspirasiService::create()
      - generate nomor tiket unik
      - simpan status = 'menunggu'
      - (opsional) panggil AI API buat auto-suggest kategori dari deskripsi
  → simpan ke DB
  → kirim WA notifikasi "aspirasi kamu diterima, cek status di link ini"
Status lifecycle: menunggu → terverifikasi (jadi kandidat pos_kebutuhan) atau ditolak (dengan alasan_tolak).
4.2 Modul Kurasi & Publikasi Kebutuhan Desa
Endpoint:
GET    /api/desa/aspirasi           (role: perangkat_desa, scoped ke desa sendiri)
PATCH  /api/desa/aspirasi/{id}/verify
POST   /api/desa/pos-kebutuhan      (publish langsung / dari aspirasi terverifikasi)
Flow:
Perangkat Desa buka dashboard → list aspirasi masuk ke desanya
  → cek duplikasi manual (atau bisa dibantu similarity check sederhana di Service)
  → Aksi: Verify (isi kuota_kelompok, deadline, jurusan_dibutuhkan, SDG tags)
      → trigger: create record pos_kebutuhan, status = 'open'
  → Aksi: Reject (wajib isi alasan_tolak)
      → kirim WA notif ke pelapor
4.3 Modul Pengajuan & Approval Proposal Mahasiswa
Endpoint:
POST   /api/proposal                    (role: mahasiswa/ketua_kelompok)
PATCH  /api/desa/proposal/{id}/decide   (role: perangkat_desa)
PATCH  /api/dosen/proposal/{id}/kelayakan (role: dosen)
Flow:
Kelompok pilih pos_kebutuhan → submit proposal
  → ProposalService::create()
      - cek kuota_kelompok pos_kebutuhan masih tersisa
      - hitung jarak_km (Haversine) & matching_score (lihat BAB 5)
      - jika jarak_km > threshold → flag butuh surat_izin_ortu
  → status = 'menunggu'
  → Dosen validasi kelayakan administratif (opsional gate sebelum ke desa,
     atau paralel — tergantung urutan yang tim mau)
  → Perangkat Desa: Approve → kuota pos_kebutuhan berkurang 1,
     proposal lain yang bersaing di pos yang sama TIDAK otomatis reject
     (desa masih bisa terima >1 kelompok kalau kuota masih ada)
  → Perangkat Desa: Reject → wajib isi catatan_desa
4.4 Modul Progress Tracking Mingguan
Endpoint:
POST   /api/progress             (role: mahasiswa, hanya proposal berstatus 'diterima')
Flow (dengan lock + double confirm):
Mahasiswa isi progress minggu ke-N
  → submit pertama: tampilkan modal "yakin? tidak bisa diedit setelah ini" (konfirmasi 1)
  → submit kedua: konfirmasi final
  → ProgressService::store()
      - insert row progress_mingguan
      - is_locked = true
  → Perangkat Desa & Dosen bisa lihat (read-only) via dashboard monitoring
4.5 Modul Verifikasi Luaran & E-Portofolio
Endpoint:
POST   /api/luaran                      (role: mahasiswa, setelah masa KKN selesai)
PATCH  /api/desa/luaran/{id}/verify     (role: perangkat_desa)
GET    /portofolio/{slug}               (public)
Flow:
Kelompok upload file_deliverable_url + deskripsi
  → status_verifikasi = 'menunggu'
  → Perangkat Desa review → Verify (disahkan_oleh, disahkan_at)
      → trigger otomatis: LuaranService::generatePortofolio()
          - generate slug_public unik
          - generate sertifikat_pdf_url (pakai library PDF, mis. DomPDF)
          - insert ke portofolio_publik
  → kelompok dapat link publik buat dicantumkan di LinkedIn/CV




BAB 5 — Algoritma & Komputasi
5.1 Haversine Distance Engine
Formula:
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
jarak_km = R × c        (R = radius bumi ≈ 6371 km)
Implementasi di MySQL (raw query, langsung filter radius):
SELECT pos_kebutuhan.*, profil_desa.latitude, profil_desa.longitude,
  (6371 * ACOS(
      COS(RADIANS(:lat_mahasiswa)) * COS(RADIANS(profil_desa.latitude)) *
      COS(RADIANS(profil_desa.longitude) - RADIANS(:lon_mahasiswa)) +
      SIN(RADIANS(:lat_mahasiswa)) * SIN(RADIANS(profil_desa.latitude))
  )) AS jarak_km
FROM pos_kebutuhan
JOIN profil_desa ON pos_kebutuhan.desa_id = profil_desa.id
HAVING jarak_km <= :radius_km
ORDER BY jarak_km ASC
Di Laravel (Service, dibungkus jadi scope/helper):
public function filterByRadius($latUser, $lonUser, $radiusKm)
{
    return PosKebutuhan::join('profil_desa', 'pos_kebutuhan.desa_id', '=', 'profil_desa.id')
        ->selectRaw("pos_kebutuhan.*, 
            (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(profil_desa.latitude)) *
            COS(RADIANS(profil_desa.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(profil_desa.latitude))) AS jarak_km",
            [$latUser, $lonUser, $latUser])
        ->having('jarak_km', '<=', $radiusKm)
        ->orderBy('jarak_km')
        ->get();
}
Dipakai juga di ProposalService pas submit — hitung jarak_km, simpan ke kolom proposal.jarak_km, lalu cek: kalau jarak_km > threshold (misal 1000 km, sesuai Otomatisasi Dokumen Persetujuan di Brainstorming) → wajib upload surat_izin_ortu.
5.2 Smart-Matching Competency Score
Konsep: cocokkan jurusan_dibutuhkan (array di pos_kebutuhan, misal ["Desain Grafis": 2, "Akuntansi": 1]) dengan jurusan_kontribusi tiap anggota_kelompok.
Formula sederhana (weighted overlap):
matching_score = (Σ jumlah_anggota_cocok_per_jurusan / total_kebutuhan_jurusan) × 100%
Contoh implementasi:
public function calculateMatchingScore(Kelompok $kelompok, PosKebutuhan $pos)
{
    $dibutuhkan = $pos->jurusan_dibutuhkan; // ["Desain Grafis" => 2, "Akuntansi" => 1]
    $anggota = $kelompok->anggotaKelompok->pluck('jurusan_kontribusi');

    $totalDibutuhkan = array_sum($dibutuhkan);
    $totalCocok = 0;

    foreach ($dibutuhkan as $jurusan => $jumlah) {
        $adaDiKelompok = $anggota->filter(fn($j) => $j === $jurusan)->count();
        $totalCocok += min($adaDiKelompok, $jumlah); // gak boleh over-count
    }

    return round(($totalCocok / $totalDibutuhkan) * 100, 2); // persentase
}
Output: badge dinamis di UI — "Kelompok Anda 92% Cocok..." (sesuai Wow Features, tab Proposal). Skor ini dihitung ulang tiap kali proposal disubmit, disimpan di proposal.matching_score (snapshot, bukan live — biar histori proposal lama gak berubah kalau komposisi kelompok berubah setelahnya).

BAB 6 — Integrasi API Eksternal
6.1 API Wilayah Indonesia
Pakai static API komunitas (mis. emsifa/api-wilayah-indonesia) buat data provinsi → kab/kota → kecamatan → desa. Dipakai di:
Dropdown cascading saat registrasi profil_desa (pilih provinsi → kab → kecamatan → nama desa resmi, biar konsisten dengan data administratif, gak typo manual)
Validasi nama desa yang didaftarkan cocok dengan data resmi (mencegah desa fiktif — related ke LOOPHOLE poin 3: cek keabsahan cap perangkat desa)
Koordinat presisi (latitude/longitude) tetap dari pin manual saat registrasi/aspirasi (sudah dibahas sebelumnya) — API wilayah ini cuma buat nama+kode administratif, bukan sumber koordinat.
// Contoh fetch di RegistrasiDesaController
$provinsi = Http::get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
$kabupaten = Http::get("https://emsifa.github.io/api-wilayah-indonesia/api/regencies/{$provinceId}.json");
6.2 WhatsApp API
Dipakai sebagai kanal notifikasi tambahan (sesuai Batasan Sistem no. 4: WhatsApp bukan penentu role, cuma kanal notifikasi). Provider: Fonnte/Wablas/Twilio WhatsApp Business API (tim tinggal pilih sesuai budget — Fonnte paling umum dipakai project mahasiswa Indonesia karena murah).
Trigger notifikasi:
Event
Penerima
Aspirasi diverifikasi/ditolak
Masyarakat (pelapor)
Proposal diterima/ditolak
Ketua kelompok
Deadline pos_kebutuhan mendekat
Kelompok yang belum submit
Reminder progress mingguan belum diisi
Ketua kelompok
Luaran akhir disahkan
Ketua kelompok


// WhatsAppService (wrapper generic)
public function send($phone, $message)
{
    Http::post('https://api.fonnte.com/send', [
        'target' => $phone,
        'message' => $message,
    ])->withHeaders(['Authorization' => config('services.fonnte.token')]);
}
Dipanggil sebagai Job/Queue (bukan sync call), biar gak nge-block response utama kalau API WA lambat/down.
6.3 AI API
Dua use-case utama:
Kategorisasi otomatis aspirasi — saat masyarakat submit deskripsi bebas, AI API bantu suggest kategori (UMKM/kesehatan/lingkungan/dll) supaya perangkat desa gak perlu kategorisasi manual dari nol, tinggal konfirmasi/koreksi.
$response = $aiService->categorize($deskripsi);
// return: ['kategori' => 'umkm', 'confidence' => 0.87]
Chatbot dengan context injection — sesuai yang udah dibahas: chatbot di web butuh konteks dari DB (data pos_kebutuhan aktif, status proposal user) supaya jawabannya relevan, bukan generik.
$context = $this->buildContext($user); // query pos_kebutuhan open, status proposal user, dll
$response = Http::post('https://api.openai.com/v1/chat/completions', [
    'model' => 'gpt-4o-mini',
    'messages' => [
        ['role' => 'system', 'content' => "Konteks platform: {$context}"],
        ['role' => 'user', 'content' => $pertanyaanUser],
    ],
]);

BAB 7 — Keamanan dan Security Sistem
7.1 Validasi Input & File Upload
FormRequest per endpoint (contoh: submit proposal):
class StoreProposalRequest extends FormRequest
{
    public function rules()
    {
        return [
            'pos_kebutuhan_id' => 'required|exists:pos_kebutuhan,id',
            'draf_proker' => 'required|string|max:5000',
            'file_proposal' => 'required|file|mimes:pdf|max:5120', // 5MB
            'surat_pengantar' => 'nullable|file|mimes:pdf|max:5120',
        ];
    }
}
Aturan upload dokumen sensitif (SK Desa, KTM, foto bukti):
Dokumen
Tipe file diizinkan
Max size
Storage
SK Perangkat Desa
pdf, jpg, png
5 MB
private disk, bukan public
KTM Mahasiswa
jpg, png, pdf
3 MB
private disk
Foto bukti aspirasi
jpg, png
5 MB
public disk (boleh tampil di katalog)
File deliverable/luaran
pdf, zip, docx
20 MB
private disk sampai luaran verified

File sensitif (SK, KTM) disimpan di private disk Laravel, diakses lewat signed URL (temporary, expire), bukan link langsung — biar gak bisa diakses sembarangan orang yang tau URL-nya.
Validasi MIME type dicek dari konten file, bukan cuma ekstensi (Laravel mimes rule udah handle ini via finfo).
7.2 Middleware Otorisasi per Endpoint
Layering-nya 2 tingkat:
Role middleware (siapa yang boleh masuk endpoint ini) — sudah dibahas di BAB 3.
Policy/scope check (dari role yang sama, apa dia boleh akses resource spesifik ini) — pakai Laravel Policy:
class ProposalPolicy
{
    public function decide(User $user, Proposal $proposal)
    {
        return $user->role === 'perangkat_desa'
            && $proposal->posKebutuhan->desa_id === $user->profilDesa->id;
    }
}

// di controller
public function decide(Request $request, Proposal $proposal)
{
    $this->authorize('decide', $proposal); // otomatis 403 kalau gak lolos policy
    // ...
}
Tambahan security:
Rate limiting di endpoint publik (aspirasi submit) — cegah spam, mis. throttle:5,1 (5 request per menit per IP)
Sanctum token expiry + refresh buat semua role berlogin
CSRF protection tetap aktif buat request dari web (bukan cuma API token)

