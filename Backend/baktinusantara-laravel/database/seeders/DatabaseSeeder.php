<?php

namespace Database\Seeders;

use App\Models\AnggotaKelompok;
use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\LaporanDosen;
use App\Models\LuaranAkhir;
use App\Models\Notifikasi;
use App\Models\PortofolioPublik;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilDosen;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\ProgressMingguan;
use App\Models\Proposal;
use App\Models\SuratIzinOrtu;
use App\Models\User;
use App\Services\CertificateService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // ==========================================
        // 1. ADMIN PLATFORM
        // ==========================================
        $admin = User::firstOrCreate(
            ['email' => 'admin@baktinusantara.id'],
            [
                'name' => 'Super Admin BaktiNusantara',
                'password' => $defaultPassword,
                'phone_wa' => '081234567890',
                'role' => 'admin',
                'is_verified' => true,
            ]
        );

        // ==========================================
        // 2. UNIVERSITAS (VERIFIED & PENDING)
        // ==========================================
        $univUnesaUser = User::firstOrCreate(
            ['email' => 'unesa@unesa.ac.id'],
            [
                'name' => 'Lembaga Pengabdian Masyarakat UNESA',
                'password' => $defaultPassword,
                'phone_wa' => '081234567001',
                'role' => 'universitas',
                'is_verified' => true,
            ]
        );
        $univUnesa = ProfilUniversitas::firstOrCreate(
            ['user_id' => $univUnesaUser->id],
            [
                'nama_universitas' => 'Universitas Negeri Surabaya',
                'kode_univ' => 'UNESA',
                'verified_at' => now(),
            ]
        );

        $univItsUser = User::firstOrCreate(
            ['email' => 'its@its.ac.id'],
            [
                'name' => 'Direktorat Riset & Pengabdian Masyarakat ITS',
                'password' => $defaultPassword,
                'phone_wa' => '081234567002',
                'role' => 'universitas',
                'is_verified' => true,
            ]
        );
        $univIts = ProfilUniversitas::firstOrCreate(
            ['user_id' => $univItsUser->id],
            [
                'nama_universitas' => 'Institut Teknologi Sepuluh Nopember',
                'kode_univ' => 'ITS',
                'verified_at' => now(),
            ]
        );

        $univUnairUser = User::firstOrCreate(
            ['email' => 'unair@unair.ac.id'],
            [
                'name' => 'LPPM Universitas Airlangga',
                'password' => $defaultPassword,
                'phone_wa' => '081234567003',
                'role' => 'universitas',
                'is_verified' => false, // Untuk testing verifikasi admin oleh frontend
            ]
        );
        $univUnair = ProfilUniversitas::firstOrCreate(
            ['user_id' => $univUnairUser->id],
            [
                'nama_universitas' => 'Universitas Airlangga',
                'kode_univ' => 'UNAIR',
                'verified_at' => null,
            ]
        );

        // ==========================================
        // 3. DOSEN PEMBIMBING LAPANGAN (DPL)
        // ==========================================
        $dosenBudiUser = User::firstOrCreate(
            ['email' => 'dosen.budi@unesa.ac.id'],
            [
                'name' => 'Dr. Budi Santoso, M.Kom.',
                'password' => $defaultPassword,
                'phone_wa' => '081234567101',
                'role' => 'dosen',
                'is_verified' => true,
            ]
        );
        $dosenBudi = ProfilDosen::firstOrCreate(
            ['user_id' => $dosenBudiUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'ditambahkan_oleh' => $univUnesaUser->id,
                'nip' => '198001012005011001',
                'no_hp' => '081234567101',
            ]
        );

        $dosenRetnoUser = User::firstOrCreate(
            ['email' => 'dosen.retno@unesa.ac.id'],
            [
                'name' => 'Dr. Retno Wulandari, M.Pd.',
                'password' => $defaultPassword,
                'phone_wa' => '081234567102',
                'role' => 'dosen',
                'is_verified' => true,
            ]
        );
        $dosenRetno = ProfilDosen::firstOrCreate(
            ['user_id' => $dosenRetnoUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'ditambahkan_oleh' => $univUnesaUser->id,
                'nip' => '198503152010122002',
                'no_hp' => '081234567102',
            ]
        );

        $dosenAgusUser = User::firstOrCreate(
            ['email' => 'dosen.agus@its.ac.id'],
            [
                'name' => 'Ir. Agus Setiawan, M.T.',
                'password' => $defaultPassword,
                'phone_wa' => '081234567103',
                'role' => 'dosen',
                'is_verified' => true,
            ]
        );
        $dosenAgus = ProfilDosen::firstOrCreate(
            ['user_id' => $dosenAgusUser->id],
            [
                'universitas_id' => $univIts->id,
                'ditambahkan_oleh' => $univItsUser->id,
                'nip' => '197908202003121003',
                'no_hp' => '081234567103',
            ]
        );

        // ==========================================
        // 4. PERANGKAT DESA (VERIFIED & PENDING)
        // ==========================================
        $desa1User = User::firstOrCreate(
            ['email' => 'desa.sukamaju@desa.id'],
            [
                'name' => 'Kantor Kepala Desa Sukamaju',
                'password' => $defaultPassword,
                'phone_wa' => '081234567201',
                'role' => 'perangkat_desa',
                'is_verified' => true,
            ]
        );
        $desaSukamaju = ProfilDesa::firstOrCreate(
            ['user_id' => $desa1User->id],
            [
                'nama_desa' => 'Desa Sukamaju',
                'kecamatan' => 'Mojowarno',
                'kabupaten' => 'Kabupaten Jombang',
                'provinsi' => 'Jawa Timur',
                'latitude' => -7.6358,
                'longitude' => 112.2965,
                'sk_file_url' => 'sk/sk_desa_sukamaju.pdf',
                'verified_at' => now(),
            ]
        );

        $desa2User = User::firstOrCreate(
            ['email' => 'desa.berkahmakmur@desa.id'],
            [
                'name' => 'Pemerintah Desa Berkah Makmur',
                'password' => $defaultPassword,
                'phone_wa' => '081234567202',
                'role' => 'perangkat_desa',
                'is_verified' => true,
            ]
        );
        $desaBerkahMakmur = ProfilDesa::firstOrCreate(
            ['user_id' => $desa2User->id],
            [
                'nama_desa' => 'Desa Berkah Makmur',
                'kecamatan' => 'Prigen',
                'kabupaten' => 'Kabupaten Pasuruan',
                'provinsi' => 'Jawa Timur',
                'latitude' => -7.6931,
                'longitude' => 112.6312,
                'sk_file_url' => 'sk/sk_desa_berkah_makmur.pdf',
                'verified_at' => now(),
            ]
        );

        $desa3User = User::firstOrCreate(
            ['email' => 'desa.cempakaputih@desa.id'],
            [
                'name' => 'Sekretariat Desa Cempaka Putih',
                'password' => $defaultPassword,
                'phone_wa' => '081234567203',
                'role' => 'perangkat_desa',
                'is_verified' => true,
            ]
        );
        $desaCempakaPutih = ProfilDesa::firstOrCreate(
            ['user_id' => $desa3User->id],
            [
                'nama_desa' => 'Desa Cempaka Putih',
                'kecamatan' => 'Pacet',
                'kabupaten' => 'Kabupaten Mojokerto',
                'provinsi' => 'Jawa Timur',
                'latitude' => -7.6698,
                'longitude' => 112.5381,
                'sk_file_url' => 'sk/sk_desa_cempaka_putih.pdf',
                'verified_at' => now(),
            ]
        );

        $desaPendingUser = User::firstOrCreate(
            ['email' => 'desa.pending@desa.id'],
            [
                'name' => 'Balai Desa Maju Bersama',
                'password' => $defaultPassword,
                'phone_wa' => '081234567204',
                'role' => 'perangkat_desa',
                'is_verified' => false, // Untuk testing verifikasi desa oleh admin di frontend
            ]
        );
        $desaPending = ProfilDesa::firstOrCreate(
            ['user_id' => $desaPendingUser->id],
            [
                'nama_desa' => 'Desa Maju Bersama',
                'kecamatan' => 'Trawas',
                'kabupaten' => 'Kabupaten Mojokerto',
                'provinsi' => 'Jawa Timur',
                'latitude' => -7.6811,
                'longitude' => 112.5934,
                'sk_file_url' => 'sk/sk_desa_pending.pdf',
                'verified_at' => null,
            ]
        );

        // ==========================================
        // 5. MAHASISWA & KELOMPOK KKN
        // ==========================================
        // Kelompok 1: UNESA (Ahmad - Ketua, Siti - Anggota, Bambang - Anggota)
        $mhsAhmadUser = User::firstOrCreate(
            ['email' => 'ketua.ahmad@mhs.unesa.ac.id'],
            [
                'name' => 'Ahmad Fauzi',
                'password' => $defaultPassword,
                'phone_wa' => '081234567301',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        $mhsAhmad = ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsAhmadUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'nim' => '23051204001',
                'jurusan' => 'Teknik Informatika',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_ahmad.pdf',
                'verified_at' => now(),
            ]
        );

        $mhsSitiUser = User::firstOrCreate(
            ['email' => 'anggota.siti@mhs.unesa.ac.id'],
            [
                'name' => 'Siti Aminah',
                'password' => $defaultPassword,
                'phone_wa' => '081234567302',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        $mhsSiti = ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsSitiUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'nim' => '23051204002',
                'jurusan' => 'Desain Komunikasi Visual',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_siti.pdf',
                'verified_at' => now(),
            ]
        );

        $mhsBambangUser = User::firstOrCreate(
            ['email' => 'anggota.bambang@mhs.unesa.ac.id'],
            [
                'name' => 'Bambang Prakoso',
                'password' => $defaultPassword,
                'phone_wa' => '081234567303',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        $mhsBambang = ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsBambangUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'nim' => '23051204003',
                'jurusan' => 'Manajemen',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_bambang.pdf',
                'verified_at' => now(),
            ]
        );

        $kelompok1 = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN UNESA 01 - Sukamaju Digital'],
            [
                'ketua_id' => $mhsAhmadUser->id,
                'dosen_id' => $dosenBudi->id,
            ]
        );
        AnggotaKelompok::firstOrCreate(
            ['kelompok_id' => $kelompok1->id, 'user_id' => $mhsAhmadUser->id],
            ['jurusan_kontribusi' => 'Teknik Informatika', 'role_in_group' => 'ketua']
        );
        AnggotaKelompok::firstOrCreate(
            ['kelompok_id' => $kelompok1->id, 'user_id' => $mhsSitiUser->id],
            ['jurusan_kontribusi' => 'Desain Komunikasi Visual', 'role_in_group' => 'anggota']
        );
        AnggotaKelompok::firstOrCreate(
            ['kelompok_id' => $kelompok1->id, 'user_id' => $mhsBambangUser->id],
            ['jurusan_kontribusi' => 'Manajemen', 'role_in_group' => 'anggota']
        );

        // Kelompok 2: ITS (Dimas - Ketua, Rina - Anggota)
        $mhsDimasUser = User::firstOrCreate(
            ['email' => 'ketua.dimas@mhs.its.ac.id'],
            [
                'name' => 'Dimas Pratama',
                'password' => $defaultPassword,
                'phone_wa' => '081234567304',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        $mhsDimas = ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsDimasUser->id],
            [
                'universitas_id' => $univIts->id,
                'nim' => '5025201001',
                'jurusan' => 'Sistem Informasi',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_dimas.pdf',
                'verified_at' => now(),
            ]
        );

        $mhsRinaUser = User::firstOrCreate(
            ['email' => 'anggota.rina@mhs.its.ac.id'],
            [
                'name' => 'Rina Kusuma',
                'password' => $defaultPassword,
                'phone_wa' => '081234567305',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        $mhsRina = ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsRinaUser->id],
            [
                'universitas_id' => $univIts->id,
                'nim' => '5025201002',
                'jurusan' => 'Teknik Lingkungan',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_rina.pdf',
                'verified_at' => now(),
            ]
        );

        $kelompok2 = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN ITS Berkah Hijau'],
            [
                'ketua_id' => $mhsDimasUser->id,
                'dosen_id' => $dosenAgus->id,
            ]
        );
        AnggotaKelompok::firstOrCreate(
            ['kelompok_id' => $kelompok2->id, 'user_id' => $mhsDimasUser->id],
            ['jurusan_kontribusi' => 'Sistem Informasi', 'role_in_group' => 'ketua']
        );
        AnggotaKelompok::firstOrCreate(
            ['kelompok_id' => $kelompok2->id, 'user_id' => $mhsRinaUser->id],
            ['jurusan_kontribusi' => 'Teknik Lingkungan', 'role_in_group' => 'anggota']
        );

        // Kelompok 3: UNESA (Bayu - Ketua)
        $mhsBayuUser = User::firstOrCreate(
            ['email' => 'ketua.bayu@mhs.unesa.ac.id'],
            [
                'name' => 'Bayu Setiawan',
                'password' => $defaultPassword,
                'phone_wa' => '081234567306',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        $mhsBayu = ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsBayuUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'nim' => '23051204004',
                'jurusan' => 'Pendidikan Bahasa Inggris',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_bayu.pdf',
                'verified_at' => now(),
            ]
        );
        $kelompok3 = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN UNESA 02 - Edukasi Cempaka'],
            [
                'ketua_id' => $mhsBayuUser->id,
                'dosen_id' => $dosenRetno->id,
            ]
        );
        AnggotaKelompok::firstOrCreate(
            ['kelompok_id' => $kelompok3->id, 'user_id' => $mhsBayuUser->id],
            ['jurusan_kontribusi' => 'Pendidikan Bahasa Inggris', 'role_in_group' => 'ketua']
        );

        // Mahasiswa Solo (Belum berkelompok) & Pending (Belum diverifikasi admin)
        $mhsSoloUser = User::firstOrCreate(
            ['email' => 'mhs.solo@mhs.unesa.ac.id'],
            [
                'name' => 'Dewi Lestari',
                'password' => $defaultPassword,
                'phone_wa' => '081234567307',
                'role' => 'mahasiswa',
                'is_verified' => true,
            ]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsSoloUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'nim' => '23051204005',
                'jurusan' => 'Kesehatan Masyarakat',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_dewi.pdf',
                'verified_at' => now(),
            ]
        );

        $mhsPendingUser = User::firstOrCreate(
            ['email' => 'mhs.pending@mhs.unesa.ac.id'],
            [
                'name' => 'Fajar Nugraha',
                'password' => $defaultPassword,
                'phone_wa' => '081234567308',
                'role' => 'mahasiswa',
                'is_verified' => false,
            ]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsPendingUser->id],
            [
                'universitas_id' => $univUnesa->id,
                'nim' => '23051204006',
                'jurusan' => 'Teknik Elektro',
                'semester' => 6,
                'ktm_file_url' => 'ktm/ktm_fajar.pdf',
                'verified_at' => null,
            ]
        );

        // ==========================================
        // 6. ASPIRASI WARGA DESA
        // ==========================================
        $aspirasi1 = Aspirasi::firstOrCreate(
            ['deskripsi' => 'Banyak pengrajin kripik singkong di dusun kami kesulitan menjual produk ke luar kota karena belum memiliki kemasan bermerek dan toko online.'],
            [
                'desa_id' => $desaSukamaju->id,
                'pelapor_nama' => 'Pak Joko Susilo (Ketua Paguyuban UMKM)',
                'pelapor_wa' => '085712345678',
                'kategori' => 'umkm',
                'latitude' => -7.6358,
                'longitude' => 112.2965,
                'urgensi' => 'mendesak',
                'status' => 'menunggu',
            ]
        );

        $aspirasi2 = Aspirasi::firstOrCreate(
            ['deskripsi' => 'Kawasan peternakan desa kami menghasilkan limbah kotoran sapi yang melimpah dan butuh inovasi instalasi biogas ramah lingkungan.'],
            [
                'desa_id' => $desaBerkahMakmur->id,
                'pelapor_nama' => 'Ibu Sri Wahyuni',
                'pelapor_wa' => '085712345679',
                'kategori' => 'lingkungan',
                'latitude' => -7.6931,
                'longitude' => 112.6312,
                'urgensi' => 'sedang',
                'status' => 'terverifikasi',
            ]
        );

        $aspirasi3 = Aspirasi::firstOrCreate(
            ['deskripsi' => 'Mohon bantuan mahasiswa untuk mengecat rumah pribadi saya.'],
            [
                'desa_id' => $desaSukamaju->id,
                'pelapor_nama' => 'Warga Anonim',
                'pelapor_wa' => '085712345680',
                'kategori' => 'fasilitas',
                'latitude' => -7.6358,
                'longitude' => 112.2965,
                'urgensi' => 'rendah',
                'status' => 'ditolak',
                'alasan_tolak' => 'Pengabdian KKN berfokus pada kemaslahatan publik dan pemberdayaan masyarakat desa, bukan keperluan pribadi.',
            ]
        );

        // ==========================================
        // 7. POS KEBUTUHAN DESA
        // ==========================================
        // Pos 1: UMKM (Status: in_progress, dikerjakan Kelompok 1)
        $pos1 = PosKebutuhan::firstOrCreate(
            ['judul' => 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong'],
            [
                'desa_id' => $desaSukamaju->id,
                'aspirasi_id' => $aspirasi1->id,
                'deskripsi' => 'Pengembangan identitas visual merek kemasan modern, pendaftaran marketplace (Shopee/Tokopedia), dan pelatihan pembukuan keuangan digital untuk 15 pelaku UMKM.',
                'kategori' => 'umkm',
                'sdg_codes' => [8, 9],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => [
                    'Teknik Informatika' => 1,
                    'Desain Komunikasi Visual' => 1,
                    'Manajemen' => 1,
                ],
                'status' => 'in_progress',
            ]
        );

        // Pos 2: Lingkungan (Status: in_progress, dikerjakan Kelompok 2)
        $pos2 = PosKebutuhan::firstOrCreate(
            ['judul' => 'Pemetaan Sistem Pengolahan Sampah Organik dan Biogas'],
            [
                'desa_id' => $desaBerkahMakmur->id,
                'aspirasi_id' => $aspirasi2->id,
                'deskripsi' => 'Perancangan instalasi prototipe biogas dari limbah kotoran ternak dan penyuluhan manajemen sampah ramah lingkungan.',
                'kategori' => 'lingkungan',
                'sdg_codes' => [13, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => [
                    'Teknik Lingkungan' => 1,
                    'Sistem Informasi' => 1,
                ],
                'status' => 'in_progress',
            ]
        );

        // Pos 3: Kesehatan (Status: open, belum ada kelompok yang diterima)
        $pos3 = PosKebutuhan::firstOrCreate(
            ['judul' => 'Pemberdayaan Posyandu Digital & Pencegahan Stunting Anak'],
            [
                'desa_id' => $desaSukamaju->id,
                'deskripsi' => 'Digitalisasi pencatatan data tumbuh kembang balita di 5 posyandu desa serta edukasi gizi seimbang bagi ibu hamil.',
                'kategori' => 'kesehatan',
                'sdg_codes' => [3],
                'kuota_kelompok' => 2,
                'deadline' => now()->addDays(30),
                'jurusan_dibutuhkan' => [
                    'Kesehatan Masyarakat' => 2,
                    'Gizi' => 1,
                    'Teknik Informatika' => 1,
                ],
                'status' => 'open',
            ]
        );

        // Pos 4: Pendidikan (Status: open, sedang dilamar Kelompok 3)
        $pos4 = PosKebutuhan::firstOrCreate(
            ['judul' => 'Bimbingan Belajar Bahasa Inggris dan Literasi Digital Sekolah Dasar'],
            [
                'desa_id' => $desaCempakaPutih->id,
                'deskripsi' => 'Penguatan kemampuan dasar bahasa Inggris interaktif dan pengenalan literasi komputer bagi siswa SDN Pacet 01.',
                'kategori' => 'pendidikan',
                'sdg_codes' => [4],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(20),
                'jurusan_dibutuhkan' => [
                    'Pendidikan Bahasa Inggris' => 1,
                    'Pendidikan Guru Sekolah Dasar' => 1,
                ],
                'status' => 'open',
            ]
        );

        // Pos 5: Fasilitas (Status: completed)
        $pos5 = PosKebutuhan::firstOrCreate(
            ['judul' => 'Perencanaan Masterplan Ruang Terbuka Hijau & Sarana Olahraga Desa'],
            [
                'desa_id' => $desaBerkahMakmur->id,
                'deskripsi' => 'Penyusunan dokumen desain teknis dan anggaran rencana pembangunan taman desa terpadu ramah lansia dan anak.',
                'kategori' => 'fasilitas',
                'sdg_codes' => [9, 11],
                'kuota_kelompok' => 1,
                'deadline' => now()->subDays(10),
                'jurusan_dibutuhkan' => [
                    'Teknik Sipil' => 1,
                    'Arsitektur' => 1,
                ],
                'status' => 'completed',
            ]
        );

        // ==========================================
        // 8. PROPOSAL PENGAJUAN KKN
        // ==========================================
        // Proposal 1: Kelompok 1 -> Pos 1 (Diterima, progres selesai, luaran verified)
        $proposal1 = Proposal::firstOrCreate(
            ['kelompok_id' => $kelompok1->id, 'pos_kebutuhan_id' => $pos1->id],
            [
                'draf_proker' => 'Program Akselerasi Pemasaran Digital & Rebranding Produk Unggulan Desa Sukamaju (Sukamaju Go Digital)',
                'file_proposal_url' => 'proposal/proposal_kkn_sukamaju_01.pdf',
                'surat_pengantar_url' => 'surat-pengantar/surat_pengantar_unesa.pdf',
                'status' => 'diterima',
                'catatan_desa' => 'Proposal sangat solutif dan sesuai dengan kebutuhan mendesak para pengrajin kripik desa.',
                'status_kelayakan_dosen' => 'layak',
                'catatan_dosen' => 'Rancangan program kerja sangat terstruktur dengan pembagian peran anggota yang proporsional.',
                'dosen_reviewed_at' => now()->subDays(25),
                'matching_score' => 100.00,
                'jarak_km' => 15.5,
                'submitted_at' => now()->subDays(28),
            ]
        );

        // Proposal 2: Kelompok 2 -> Pos 2 (Diterima, jarak > 1000km, surat izin ortu ada)
        $proposal2 = Proposal::firstOrCreate(
            ['kelompok_id' => $kelompok2->id, 'pos_kebutuhan_id' => $pos2->id],
            [
                'draf_proker' => 'Rancang Bangun Reaktor Biogas Skala Rumah Tangga dan Edukasi Energi Terbarukan',
                'file_proposal_url' => 'proposal/proposal_kkn_its_berkah.pdf',
                'surat_pengantar_url' => 'surat-pengantar/surat_pengantar_its.pdf',
                'status' => 'diterima',
                'catatan_desa' => 'Disetujui. Tim desa siap menyediakan lokasi pilot project dan material pendukung.',
                'status_kelayakan_dosen' => 'layak',
                'catatan_dosen' => 'Aspek keselamatan kerja dan rancangan teknis sudah memenuhi standar pengabdian.',
                'dosen_reviewed_at' => now()->subDays(15),
                'matching_score' => 100.00,
                'jarak_km' => 1250.0,
                'submitted_at' => now()->subDays(18),
            ]
        );
        SuratIzinOrtu::firstOrCreate(
            ['proposal_id' => $proposal2->id],
            [
                'required' => true,
                'file_url' => 'surat-izin-ortu/surat_izin_ortu_kelompok2.pdf',
                'uploaded_at' => now()->subDays(17),
            ]
        );

        // Proposal 3: Kelompok 3 -> Pos 4 (Menunggu review desa & dosen)
        $proposal3 = Proposal::firstOrCreate(
            ['kelompok_id' => $kelompok3->id, 'pos_kebutuhan_id' => $pos4->id],
            [
                'draf_proker' => 'Fun English & Digital Literacy Academy untuk Generasi Emas Desa Cempaka Putih',
                'file_proposal_url' => 'proposal/proposal_kkn_unesa_edukasi.pdf',
                'surat_pengantar_url' => 'surat-pengantar/surat_pengantar_unesa_02.pdf',
                'status' => 'menunggu',
                'status_kelayakan_dosen' => 'belum_ditinjau',
                'matching_score' => 50.00,
                'jarak_km' => 28.3,
                'submitted_at' => now()->subDays(2),
            ]
        );

        // ==========================================
        // 9. PROGRESS MINGGUAN (PROPOSAL 1 & 2)
        // ==========================================
        // Progres Proposal 1 (4 Minggu Selesai 100%)
        ProgressMingguan::firstOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 1],
            [
                'persentase' => 25,
                'deskripsi' => 'Survei mendalam ke 15 pengrajin kripik singkong, pendataan bahan baku, dan identifikasi kelemahan kemasan lama.',
                'foto_url' => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(21),
            ]
        );
        ProgressMingguan::firstOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 2],
            [
                'persentase' => 50,
                'deskripsi' => 'Desain ulang logo "Keripik Singkong Barokah Sukamaju", pembuatan template standing pouch kedap udara, dan sesi foto katalog produk.',
                'foto_url' => 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(14),
            ]
        );
        ProgressMingguan::firstOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 3],
            [
                'persentase' => 75,
                'deskripsi' => 'Pendaftaran akun resmi marketplace Shopee & Tokopedia, integrasi sistem pembayaran QRIS, serta launching website katalog UMKM desa.',
                'foto_url' => 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(7),
            ]
        );
        ProgressMingguan::firstOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 4],
            [
                'persentase' => 100,
                'deskripsi' => 'Pelatihan pembukuan keuangan digital melalui aplikasi BukuKas, serah terima aset digital kepada perangkat desa, dan evaluasi penjualan awal.',
                'foto_url' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(2),
            ]
        );

        // Progres Proposal 2 (2 Minggu Berjalan)
        ProgressMingguan::firstOrCreate(
            ['proposal_id' => $proposal2->id, 'minggu_ke' => 1],
            [
                'persentase' => 30,
                'deskripsi' => 'Penggalian lahan digester biogas dan penyiapan instalasi pipa distribusi ke rumah warga.',
                'foto_url' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(10),
            ]
        );
        ProgressMingguan::firstOrCreate(
            ['proposal_id' => $proposal2->id, 'minggu_ke' => 2],
            [
                'persentase' => 60,
                'deskripsi' => 'Pemasangan kubah penampung gas metana dan uji coba pengisian awal kotoran ternak ke dalam inlet biodigester.',
                'foto_url' => 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(3),
            ]
        );

        // ==========================================
        // 10. LUARAN AKHIR, PORTOFOLIO & E-SERTEFIKAT
        // ==========================================
        $luaran1 = LuaranAkhir::firstOrCreate(
            ['proposal_id' => $proposal1->id],
            [
                'file_deliverable_url' => 'luaran-deliverables/paket_luaran_kkn_sukamaju_01.zip',
                'deskripsi' => 'Paket Master Desain Kemasan, Akun Resmi Marketplace, Buku Panduan Pemasaran Digital UMKM, dan Aplikasi Pencatatan Keuangan.',
                'status_verifikasi' => 'verified',
                'disahkan_oleh' => $desa1User->id,
                'disahkan_at' => now()->subDay(),
            ]
        );

        $portofolio1 = PortofolioPublik::firstOrCreate(
            ['luaran_id' => $luaran1->id],
            [
                'slug_public' => 'digitalisasi-branding-dan-e-commerce-umkm-kripik-singkong-sukamaju',
                'ringkasan_dampak' => 'Berhasil mendigitalisasi 15 pelaku UMKM kripik singkong dengan peningkatan rata-rata omzet bulanan sebesar 65% dalam 30 hari pertama pasca-peluncuran marketplace dan kemasan bermerek.',
                'testimoni_desa' => 'Kehadiran mahasiswa KKN UNESA membawa dampak nyata bagi para pengrajin kecil di desa kami. Produk lokal kami sekarang dipesan hingga ke luar Jawa!',
                'published_at' => now()->subDay(),
            ]
        );

        // Generate printable PDF certificate for portfolio
        try {
            $certificateService = app(CertificateService::class);
            $certUrl = $certificateService->generate($portofolio1);
            $portofolio1->update(['sertifikat_pdf_url' => $certUrl]);
        } catch (\Throwable $e) {
            $portofolio1->update(['sertifikat_pdf_url' => 'certificates/sertifikat-digitalisasi-sukamaju.pdf']);
        }

        // ==========================================
        // 11. LAPORAN EVALUASI KINERJA DOSEN DPL
        // ==========================================
        LaporanDosen::firstOrCreate(
            ['dosen_id' => $dosenBudi->id, 'desa_id' => $desaSukamaju->id],
            [
                'proposal_id' => $proposal1->id,
                'status' => 'ditinjau',
                'isi' => 'Dr. Budi Santoso sangat aktif mendampingi kelompok mahasiswa di lapangan, menghadiri audiensi dengan perangkat desa, serta memberikan arahan teknis yang selaras dengan kebutuhan warga kami.',
            ]
        );

        LaporanDosen::firstOrCreate(
            ['dosen_id' => $dosenAgus->id, 'desa_id' => $desaBerkahMakmur->id],
            [
                'proposal_id' => $proposal2->id,
                'status' => 'menunggu',
                'isi' => 'DPL hadir pada pembukaan dan aktif memberikan konsultasi daring terkait keselamatan instalasi reaktor biogas.',
            ]
        );

        // ==========================================
        // 12. PUSAT NOTIFIKASI REAL-TIME SEEDER
        // ==========================================
        // Notifikasi untuk Desa Sukamaju
        Notifikasi::firstOrCreate(
            ['user_id' => $desa1User->id, 'pesan' => "Proposal baru diajukan oleh kelompok 'KKN UNESA 01 - Sukamaju Digital' untuk pos kebutuhan 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong'."],
            ['channel' => 'in_app', 'is_read' => true, 'read_at' => now()->subDays(27)]
        );
        Notifikasi::firstOrCreate(
            ['user_id' => $desa1User->id, 'pesan' => "Kelompok 'KKN UNESA 01 - Sukamaju Digital' telah mengunggah luaran akhir KKN untuk divalidasi."],
            ['channel' => 'in_app', 'is_read' => true, 'read_at' => now()->subDays(1)]
        );

        // Notifikasi untuk Mahasiswa Ketua (Ahmad)
        Notifikasi::firstOrCreate(
            ['user_id' => $mhsAhmadUser->id, 'pesan' => "Proposal kelompok Anda untuk pos kebutuhan 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong' telah disetujui (diterima) oleh pihak desa."],
            ['channel' => 'in_app', 'is_read' => true, 'read_at' => now()->subDays(25)]
        );
        Notifikasi::firstOrCreate(
            ['user_id' => $mhsAhmadUser->id, 'pesan' => "Selamat! Luaran akhir kelompok Anda telah divalidasi oleh desa 'Desa Sukamaju'. E-Portofolio publik dan sertifikat Anda telah terbit."],
            ['channel' => 'in_app', 'is_read' => false, 'read_at' => null]
        );

        // Notifikasi untuk Dosen Pembimbing (Dr. Budi)
        Notifikasi::firstOrCreate(
            ['user_id' => $dosenBudiUser->id, 'pesan' => "Kelompok 'KKN UNESA 01 - Sukamaju Digital' telah menetapkan Anda sebagai Dosen Pembimbing Lapangan."],
            ['channel' => 'in_app', 'is_read' => true, 'read_at' => now()->subDays(28)]
        );
        Notifikasi::firstOrCreate(
            ['user_id' => $dosenBudiUser->id, 'pesan' => "Kelompok bimbingan 'KKN UNESA 01 - Sukamaju Digital' telah melaporkan progres minggu ke-4 (100%)."],
            ['channel' => 'in_app', 'is_read' => false, 'read_at' => null]
        );
        Notifikasi::firstOrCreate(
            ['user_id' => $dosenBudiUser->id, 'pesan' => "Desa 'Desa Sukamaju' telah mengirimkan evaluasi kinerja pembimbingan KKN."],
            ['channel' => 'in_app', 'is_read' => false, 'read_at' => null]
        );

        // Notifikasi untuk Universitas UNESA
        Notifikasi::firstOrCreate(
            ['user_id' => $univUnesaUser->id, 'pesan' => "Desa 'Desa Sukamaju' telah mengirimkan evaluasi kinerja untuk DPL Dr. Budi Santoso, M.Kom.."],
            ['channel' => 'in_app', 'is_read' => false, 'read_at' => null]
        );

        // Notifikasi untuk Mahasiswa Ketua 3 (Bayu)
        Notifikasi::firstOrCreate(
            ['user_id' => $mhsBayuUser->id, 'pesan' => "Proposal kelompok Anda untuk pos kebutuhan 'Bimbingan Belajar Bahasa Inggris dan Literasi Digital Sekolah Dasar' berhasil diajukan dan sedang menunggu review desa."],
            ['channel' => 'in_app', 'is_read' => false, 'read_at' => null]
        );
    }
}