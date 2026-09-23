# BaktiNusantara

**Platform kolaborasi berbasis web untuk menyelaraskan kebutuhan riil desa dengan program kerja KKN mahasiswa, berlandaskan 17 SDGs.**

Dikembangkan oleh Tim Gayatama 5 untuk *International Web Technology Competition* — Universitas Negeri Surabaya, 2026.

---

## Mengapa Program KKN Butuh BaktiNusantara

Setiap tahun, ribuan mahasiswa dari berbagai perguruan tinggi di Indonesia berangkat ke desa untuk menjalankan Kuliah Kerja Nyata (KKN). Niatnya selalu baik: mengabdi, belajar dari masyarakat, dan membawa perubahan bagi desa yang mereka tuju.

Masalahnya, program kerja itu sering disusun sebelum mahasiswa benar-benar mengenal desanya. Rencana kegiatan biasanya dibuat berdasarkan asumsi kampus atau pengalaman kelompok sebelumnya, bukan dari kebutuhan yang benar-benar dirasakan warga.

```mermaid
flowchart LR
    A[Mahasiswa menyusun program<br/>dari asumsi kampus] --> B[Salah sasaran:<br/>desa butuh A, mahasiswa siapkan B]
    B --> C[Program selesai,<br/>mahasiswa pulang]
    C --> D[Hasil kerja terputus]
```

Akibatnya, program yang dijalankan kerap bersifat seremonial — sekali jalan, tanpa tindak lanjut. Di sisi lain, perangkat desa dan pengelola BUMDes juga belum punya wadah resmi untuk menyampaikan kendala yang sebenarnya mereka hadapi: legalitas kemasan UMKM, penanganan stunting, sampai penataan administrasi desa. Komunikasi yang ada sering berhenti di percakapan pribadi, dan begitu masa tugas mahasiswa selesai, hasil kerjanya ikut tersimpan di folder yang tidak pernah dibuka lagi oleh siapa pun.

BaktiNusantara dibangun untuk menutup celah itu — menata ulang hubungan antara desa, mahasiswa, dan kampus supaya setiap langkah pengabdian bertumpu pada persoalan yang nyata.

---

## Gagasan: Membalik Alurnya

Selama ini KKN berjalan satu arah: mahasiswa datang membawa rencana, desa menerima. BaktiNusantara membalik urutan itu. Desa bicara lebih dulu soal apa yang mereka butuhkan, baru kemudian mahasiswa memilih program yang sesuai dengan bidang ilmu kelompoknya.

```mermaid
flowchart LR
    A[Desa Bicara<br/>Unggah kebutuhan riil] --> B[Mahasiswa Memilih<br/>Sesuai jurusan, disetujui DPL]
    B --> C[Dampak Nyata<br/>Portofolio & e-sertifikat]
```

Dengan begitu, desa bukan lagi sekadar lokasi penempatan. Mereka jadi mitra yang ikut menentukan arah pembangunan wilayahnya sendiri, bersama civitas akademika.

---

## Alur Kerja

Prosesnya dirancang sesederhana mungkin — termasuk untuk perangkat desa yang baru pertama kali memakai sistem digital semacam ini.

```mermaid
flowchart LR
    A[Masuk Platform] --> B[Telusuri Kebutuhan Desa]
    B --> C[Sesuaikan Keahlian]
    C --> D[Ajukan Program]
    D --> E[Validasi DPL & Desa]
    E --> F[Catat Progres]
    F --> G[Terbit Portofolio]
```

1. **Desa menyampaikan kebutuhan.** Perangkat desa menuliskan kendala atau program yang perlu pendampingan, lengkap dengan rincian masalah, lokasi, dan batas waktu pengajuan.
2. **Mahasiswa mencari program yang cocok.** Kelompok menjelajahi daftar kebutuhan desa, mempertimbangkan kesesuaian bidang ilmu, dan mengecek perkiraan jarak dari kampus ke lokasi.
3. **Rencana disusun bersama, lalu disetujui.** Mahasiswa menyusun rancangan program bersama Dosen Pembimbing Lapangan (DPL), sebelum akhirnya ditinjau dan diputuskan oleh pihak desa.
4. **Progres dicatat selama pengabdian berjalan.** Mahasiswa melaporkan capaian secara berkala, dan laporan itu bisa dipantau langsung oleh dosen pembimbing maupun perangkat desa.
5. **Hasil kerja disahkan jadi dokumentasi permanen.** Begitu masa pengabdian selesai, desa mengesahkan hasil karya mahasiswa menjadi portofolio resmi dan sertifikat digital — tersimpan rapi sebagai rujukan untuk periode KKN berikutnya.

---

## Fitur Utama

- **Katalog Kebutuhan Desa** — wadah resmi bagi pemerintah desa untuk mempublikasikan kebutuhan prioritas, mulai dari penguatan UMKM, sanitasi lingkungan, sampai digitalisasi layanan desa.
- **Peta Lokasi & Estimasi Jarak** — menampilkan sebaran pos kebutuhan desa secara spasial, supaya mahasiswa bisa memperkirakan waktu tempuh, mobilitas, dan kesiapan logistik sebelum berangkat.
- **Penyelarasan Kompetensi** — membantu mahasiswa menemukan kebutuhan desa yang paling relevan dengan latar belakang program studinya, supaya solusi yang diberikan benar-benar aplikatif.
- **Peninjauan & Persetujuan oleh Desa** — wewenang menyeleksi dan menyetujui proposal kelompok mahasiswa ada sepenuhnya di tangan desa, bukan ditentukan sepihak oleh kampus.
- **Portofolio Tervalidasi & E-Sertifikat** — modul pelatihan, desain kemasan, peta potensi desa: setiap karya nyata mahasiswa didokumentasikan dan disahkan langsung oleh kepala desa.
- **Ruang Pemantauan untuk Kampus** — LPPM dan DPL bisa mendampingi kelompok bimbingan, meninjau laporan mingguan, dan mengevaluasi capaian program dari satu tempat yang sama.

---

## Manfaat untuk Tiap Pihak

| Pihak | Yang mereka dapatkan |
|---|---|
| Pemerintah & mitra desa | Bantuan keahlian mahasiswa yang tepat sasaran, arsip hasil kegiatan yang rapi, dan kendali penuh atas program yang masuk ke desanya. |
| Mahasiswa KKN | Kepastian lokasi dan program sebelum berangkat, kegiatan yang sesuai jurusan, dan portofolio pengabdian yang diakui resmi oleh desa. |
| DPL & kampus | Pemantauan bimbingan yang terpusat, evaluasi lapangan yang lebih mudah, dan kepastian keselamatan mahasiswa lewat pencatatan jarak lokasi. |
| Warga & pelaku UMKM | Kanal aduan langsung untuk menyampaikan aspirasi lingkungan, plus pendampingan usaha berkelanjutan dari mahasiswa. |

---

## Keterkaitan dengan SDGs

Setiap kebutuhan desa yang diunggah dikaitkan dengan Tujuan Pembangunan Berkelanjutan (SDGs) yang relevan, sehingga kontribusi mahasiswa bisa diukur dampaknya secara konkret:

| SDG | Bentuk Kontribusi |
|---|---|
| SDG 1 — Tanpa Kemiskinan | Pendampingan pembukuan dan pengembangan UMKM |
| SDG 3 — Kehidupan Sehat | Edukasi gizi dan pencegahan stunting |
| SDG 4 — Pendidikan Berkualitas | Bimbingan belajar dan literasi digital desa |
| SDG 8 — Pekerjaan Layak | Digitalisasi pemasaran produk desa |
| SDG 9 — Industri & Inovasi | Penataan administrasi dan sistem informasi desa |
| SDG 11 — Kawasan Berkelanjutan | Pemetaan wilayah dan potensi lokal |
| SDG 13 — Penanganan Perubahan Iklim | Pengelolaan sampah dan penghijauan |
| SDG 17 — Kemitraan untuk Mencapai Tujuan | Sinergi antara perguruan tinggi dan desa |

---

## Yang Membedakan BaktiNusantara

| Aspek | KKN Konvensional | BaktiNusantara |
|---|---|---|
| Titik awal program | Disusun mahasiswa dari asumsi atau survei singkat setelah tiba di lokasi | Diawali dari kebutuhan yang diunggah langsung oleh desa |
| Akses informasi desa | Terbatas pada komunikasi personal, tidak tercatat | Terbuka lewat katalog kebutuhan yang bisa diakses siapa saja |
| Peran desa | Cenderung pasif, sekadar lokasi penempatan | Aktif menyeleksi dan menyetujui proposal yang masuk |
| Kesesuaian keilmuan | Rawan tidak nyambung antara jurusan dan kebutuhan | Diarahkan lewat pencocokan kompetensi ke pos kebutuhan spesifik |
| Keberlanjutan hasil | Kerja terputus begitu masa KKN selesai | Tersimpan dalam portofolio digital, jadi rujukan periode berikutnya |

---

## Keberlanjutan Jangka Panjang

Tiga hal yang membuat BaktiNusantara dirancang untuk bertahan lebih dari satu periode KKN:

1. **Estafet data antarperiode** — kebutuhan desa yang belum tuntas di satu periode bisa dilanjutkan kelompok berikutnya, sehingga pembangunan desa tidak perlu dimulai dari nol tiap tahun.
2. **Penguatan lembaga desa** — program yang tepat sasaran membantu BUMDes dan Karang Taruna menjadi lebih mandiri mengelola potensi lokalnya sendiri.
3. **Efisiensi pengabdian kampus** — LPPM punya data sebaran KKN yang merata, sehingga tidak ada penumpukan mahasiswa di desa yang sama sementara desa lain justru kekurangan bantuan.

---

## Penutup

BaktiNusantara berangkat dari gagasan sederhana: kegiatan KKN akan lebih bermakna kalau titik awalnya adalah kebutuhan desa itu sendiri, bukan asumsi yang dibawa dari kampus. Lewat keterbukaan informasi, kesesuaian keilmuan, dan dokumentasi kerja yang tidak berhenti begitu mahasiswa pulang, pengabdian ini diharapkan bisa terus berlanjut dari satu periode KKN ke periode berikutnya.

*Tim Gayatama 5 — Universitas Negeri Surabaya, 2026*