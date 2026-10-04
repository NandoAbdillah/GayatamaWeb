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
        // 2. UNIVERSITAS SE-INDONESIA
        // ==========================================
        $universitiesData = [
            ['email' => 'unesa@unesa.ac.id', 'name' => 'Lembaga Pengabdian Masyarakat UNESA', 'univ' => 'Universitas Negeri Surabaya', 'kode' => 'UNESA', 'verified' => true, 'phone' => '081234567001'],
            ['email' => 'its@its.ac.id', 'name' => 'Direktorat Riset & Pengabdian Masyarakat ITS', 'univ' => 'Institut Teknologi Sepuluh Nopember', 'kode' => 'ITS', 'verified' => true, 'phone' => '081234567002'],
            ['email' => 'unair@unair.ac.id', 'name' => 'LPPM Universitas Airlangga', 'univ' => 'Universitas Airlangga', 'kode' => 'UNAIR', 'verified' => false, 'phone' => '081234567003'],
            ['email' => 'ub@ub.ac.id', 'name' => 'LPPM Universitas Brawijaya', 'univ' => 'Universitas Brawijaya', 'kode' => 'UB', 'verified' => true, 'phone' => '081234567004'],
            ['email' => 'itb@itb.ac.id', 'name' => 'LPPM Institut Teknologi Bandung', 'univ' => 'Institut Teknologi Bandung', 'kode' => 'ITB', 'verified' => true, 'phone' => '081234567005'],
            ['email' => 'unpad@unpad.ac.id', 'name' => 'Direktorat Riset & Pengabdian Masyarakat UNPAD', 'univ' => 'Universitas Padjadjaran', 'kode' => 'UNPAD', 'verified' => true, 'phone' => '081234567006'],
            ['email' => 'ugm@ugm.ac.id', 'name' => 'Direktorat Pengabdian kepada Masyarakat UGM', 'univ' => 'Universitas Gadjah Mada', 'kode' => 'UGM', 'verified' => true, 'phone' => '081234567007'],
            ['email' => 'ui@ui.ac.id', 'name' => 'Direktorat Pengabdian & Pemberdayaan Masyarakat UI', 'univ' => 'Universitas Indonesia', 'kode' => 'UI', 'verified' => true, 'phone' => '081234567008'],
            ['email' => 'undip@undip.ac.id', 'name' => 'LPPM Universitas Diponegoro', 'univ' => 'Universitas Diponegoro', 'kode' => 'UNDIP', 'verified' => true, 'phone' => '081234567009'],
            ['email' => 'unand@unand.ac.id', 'name' => 'LPPM Universitas Andalas', 'univ' => 'Universitas Andalas', 'kode' => 'UNAND', 'verified' => true, 'phone' => '081234567010'],
            ['email' => 'unhas@unhas.ac.id', 'name' => 'LPPM Universitas Hasanuddin', 'univ' => 'Universitas Hasanuddin', 'kode' => 'UNHAS', 'verified' => true, 'phone' => '081234567011'],
            ['email' => 'unud@unud.ac.id', 'name' => 'LPPM Universitas Udayana', 'univ' => 'Universitas Udayana', 'kode' => 'UNUD', 'verified' => true, 'phone' => '081234567012'],
            ['email' => 'usk@usk.ac.id', 'name' => 'LPPM Universitas Syiah Kuala', 'univ' => 'Universitas Syiah Kuala', 'kode' => 'USK', 'verified' => true, 'phone' => '081234567013'],
            ['email' => 'unmul@unmul.ac.id', 'name' => 'LPPM Universitas Mulawarman', 'univ' => 'Universitas Mulawarman', 'kode' => 'UNMUL', 'verified' => true, 'phone' => '081234567014'],
            ['email' => 'unram@unram.ac.id', 'name' => 'LPPM Universitas Mataram', 'univ' => 'Universitas Mataram', 'kode' => 'UNRAM', 'verified' => true, 'phone' => '081234567015'],
            ['email' => 'uncen@uncen.ac.id', 'name' => 'LPPM Universitas Cenderawasih', 'univ' => 'Universitas Cenderawasih', 'kode' => 'UNCEN', 'verified' => true, 'phone' => '081234567016'],
            ['email' => 'uns@uns.ac.id', 'name' => 'LPPM Universitas Sebelas Maret', 'univ' => 'Universitas Sebelas Maret', 'kode' => 'UNS', 'verified' => true, 'phone' => '081234567017'],
            ['email' => 'usu@usu.ac.id', 'name' => 'LPPM Universitas Sumatera Utara', 'univ' => 'Universitas Sumatera Utara', 'kode' => 'USU', 'verified' => true, 'phone' => '081234567018'],
        ];

        $univMap = [];
        $univUserMap = [];

        foreach ($universitiesData as $u) {
            $uUser = User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => $defaultPassword,
                    'phone_wa' => $u['phone'],
                    'role' => 'universitas',
                    'is_verified' => $u['verified'],
                ]
            );
            $uProf = ProfilUniversitas::firstOrCreate(
                ['user_id' => $uUser->id],
                [
                    'nama_universitas' => $u['univ'],
                    'kode_univ' => $u['kode'],
                    'verified_at' => $u['verified'] ? now() : null,
                ]
            );
            $univMap[$u['kode']] = $uProf;
            $univUserMap[$u['kode']] = $uUser;
        }

        $univUnesa = $univMap['UNESA'];
        $univUnesaUser = $univUserMap['UNESA'];
        $univIts = $univMap['ITS'];
        $univItsUser = $univUserMap['ITS'];
        $univUb = $univMap['UB'];
        $univUbUser = $univUserMap['UB'];
        $univItb = $univMap['ITB'];
        $univItbUser = $univUserMap['ITB'];
        $univUnpad = $univMap['UNPAD'];
        $univUnpadUser = $univUserMap['UNPAD'];
        $univUgm = $univMap['UGM'];
        $univUgmUser = $univUserMap['UGM'];
        $univUnhas = $univMap['UNHAS'];
        $univUnhasUser = $univUserMap['UNHAS'];
        $univUnud = $univMap['UNUD'];
        $univUnudUser = $univUserMap['UNUD'];
        $univUnand = $univMap['UNAND'];
        $univUnandUser = $univUserMap['UNAND'];

        // ==========================================
        // 3. DOSEN PEMBIMBING LAPANGAN (DPL)
        // ==========================================
        $dosenList = [
            ['email' => 'dosen.budi@unesa.ac.id', 'name' => 'Dr. Budi Santoso, M.Kom.', 'nip' => '198001012005011001', 'univ' => 'UNESA', 'phone' => '081234567101'],
            ['email' => 'dosen.retno@unesa.ac.id', 'name' => 'Dr. Retno Wulandari, M.Pd.', 'nip' => '198503152010122002', 'univ' => 'UNESA', 'phone' => '081234567102'],
            ['email' => 'dosen.agus@its.ac.id', 'name' => 'Ir. Agus Setiawan, M.T.', 'nip' => '197908202003121003', 'univ' => 'ITS', 'phone' => '081234567103'],
            ['email' => 'dosen.arief@ub.ac.id', 'name' => 'Dr. Ir. Arief Hidayat, M.Sc.', 'nip' => '197504121999031002', 'univ' => 'UB', 'phone' => '081234567104'],
            ['email' => 'dosen.hendra@itb.ac.id', 'name' => 'Prof. Dr. Ir. Hendra Gunawan, M.Eng.', 'nip' => '196802101993031001', 'univ' => 'ITB', 'phone' => '081234567105'],
            ['email' => 'dosen.rina@unpad.ac.id', 'name' => 'Dr. Rina Marlina, S.P., M.Si.', 'nip' => '198211052008012004', 'univ' => 'UNPAD', 'phone' => '081234567106'],
            ['email' => 'dosen.suryanto@ugm.ac.id', 'name' => 'Dr. Suryanto, S.E., M.Ec.Dev.', 'nip' => '197607182002121002', 'univ' => 'UGM', 'phone' => '081234567107'],
            ['email' => 'dosen.ilyas@unhas.ac.id', 'name' => 'Dr. Andi Muhammad Ilyas, S.T., M.T.', 'nip' => '198105242006041001', 'univ' => 'UNHAS', 'phone' => '081234567108'],
            ['email' => 'dosen.widnyana@unud.ac.id', 'name' => 'Dr. I Ketut Widnyana, M.Si.', 'nip' => '197809142005011003', 'univ' => 'UNUD', 'phone' => '081234567109'],
            ['email' => 'dosen.mahfud@unand.ac.id', 'name' => 'Prof. Dr. Ir. Mahfud, M.P.', 'nip' => '197103211997021001', 'univ' => 'UNAND', 'phone' => '081234567110'],
        ];

        $dosenMap = [];
        $dosenUserMap = [];

        foreach ($dosenList as $d) {
            $dUser = User::firstOrCreate(
                ['email' => $d['email']],
                [
                    'name' => $d['name'],
                    'password' => $defaultPassword,
                    'phone_wa' => $d['phone'],
                    'role' => 'dosen',
                    'is_verified' => true,
                ]
            );
            $dProf = ProfilDosen::firstOrCreate(
                ['user_id' => $dUser->id],
                [
                    'universitas_id' => $univMap[$d['univ']]->id,
                    'ditambahkan_oleh' => $univUserMap[$d['univ']]->id,
                    'nip' => $d['nip'],
                    'no_hp' => $d['phone'],
                ]
            );
            $dosenMap[$d['email']] = $dProf;
            $dosenUserMap[$d['email']] = $dUser;
        }

        $dosenBudi = $dosenMap['dosen.budi@unesa.ac.id'];
        $dosenBudiUser = $dosenUserMap['dosen.budi@unesa.ac.id'];
        $dosenRetno = $dosenMap['dosen.retno@unesa.ac.id'];
        $dosenAgus = $dosenMap['dosen.agus@its.ac.id'];
        $dosenArief = $dosenMap['dosen.arief@ub.ac.id'];
        $dosenHendra = $dosenMap['dosen.hendra@itb.ac.id'];
        $dosenRinaMarlina = $dosenMap['dosen.rina@unpad.ac.id'];
        $dosenSuryanto = $dosenMap['dosen.suryanto@ugm.ac.id'];
        $dosenIlyas = $dosenMap['dosen.ilyas@unhas.ac.id'];
        $dosenWidnyana = $dosenMap['dosen.widnyana@unud.ac.id'];
        $dosenMahfud = $dosenMap['dosen.mahfud@unand.ac.id'];

        // ==========================================
        // 4. DESA RESMI SE-INDONESIA (20 DESA)
        // ==========================================
        $villagesData = [
            ['email' => 'desa.sukamaju@desa.id', 'name' => 'Kantor Kepala Desa Sukamaju', 'desa' => 'Desa Sukamaju', 'kec' => 'Mojowarno', 'kab' => 'Kabupaten Jombang', 'prov' => 'Jawa Timur', 'lat' => -7.6358, 'lon' => 112.2965, 'verified' => true, 'phone' => '081234567201'],
            ['email' => 'desa.berkahmakmur@desa.id', 'name' => 'Pemerintah Desa Berkah Makmur', 'desa' => 'Desa Berkah Makmur', 'kec' => 'Prigen', 'kab' => 'Kabupaten Pasuruan', 'prov' => 'Jawa Timur', 'lat' => -7.6931, 'lon' => 112.6312, 'verified' => true, 'phone' => '081234567202'],
            ['email' => 'desa.cempakaputih@desa.id', 'name' => 'Sekretariat Desa Cempaka Putih', 'desa' => 'Desa Cempaka Putih', 'kec' => 'Pacet', 'kab' => 'Kabupaten Mojokerto', 'prov' => 'Jawa Timur', 'lat' => -7.6698, 'lon' => 112.5381, 'verified' => true, 'phone' => '081234567203'],
            ['email' => 'desa.pending@desa.id', 'name' => 'Balai Desa Maju Bersama', 'desa' => 'Desa Maju Bersama', 'kec' => 'Trawas', 'kab' => 'Kabupaten Mojokerto', 'prov' => 'Jawa Timur', 'lat' => -7.6811, 'lon' => 112.5934, 'verified' => false, 'phone' => '081234567204'],
            ['email' => 'desa.pujonkidul@desa.id', 'name' => 'Pemerintah Desa Wisata Pujon Kidul', 'desa' => 'Desa Wisata Pujon Kidul', 'kec' => 'Pujon', 'kab' => 'Kabupaten Malang', 'prov' => 'Jawa Timur', 'lat' => -7.8631, 'lon' => 112.4842, 'verified' => true, 'phone' => '081234567205'],
            ['email' => 'desa.cibodas@desa.id', 'name' => 'Kantor Desa Cibodas Lembang', 'desa' => 'Desa Cibodas', 'kec' => 'Lembang', 'kab' => 'Kabupaten Bandung Barat', 'prov' => 'Jawa Barat', 'lat' => -6.8294, 'lon' => 107.6711, 'verified' => true, 'phone' => '081234567206'],
            ['email' => 'desa.sukapura@desa.id', 'name' => 'Kantor Desa Sukapura Dayeuhkolot', 'desa' => 'Desa Sukapura', 'kec' => 'Dayeuhkolot', 'kab' => 'Kabupaten Bandung', 'prov' => 'Jawa Barat', 'lat' => -6.9745, 'lon' => 107.6322, 'verified' => true, 'phone' => '081234567207'],
            ['email' => 'desa.ponggok@desa.id', 'name' => 'Pemerintah Desa Ponggok Klaten', 'desa' => 'Desa Ponggok', 'kec' => 'Polanharjo', 'kab' => 'Kabupaten Klaten', 'prov' => 'Jawa Tengah', 'lat' => -7.6189, 'lon' => 110.6432, 'verified' => true, 'phone' => '081234567208'],
            ['email' => 'desa.pentingsari@desa.id', 'name' => 'Sekretariat Desa Wisata Pentingsari', 'desa' => 'Desa Pentingsari', 'kec' => 'Cangkringan', 'kab' => 'Kabupaten Sleman', 'prov' => 'D.I. Yogyakarta', 'lat' => -7.6258, 'lon' => 110.4372, 'verified' => true, 'phone' => '081234567209'],
            ['email' => 'nagari.pariangan@desa.id', 'name' => 'Kerapatan Adat Nagari Pariangan', 'desa' => 'Nagari Pariangan', 'kec' => 'Pariangan', 'kab' => 'Kabupaten Tanah Datar', 'prov' => 'Sumatera Barat', 'lat' => -0.4497, 'lon' => 100.4952, 'verified' => true, 'phone' => '081234567210'],
            ['email' => 'desa.penglipuran@desa.id', 'name' => 'Prapat Agung Desa Adat Penglipuran', 'desa' => 'Desa Adat Penglipuran', 'kec' => 'Bangli', 'kab' => 'Kabupaten Bangli', 'prov' => 'Bali', 'lat' => -8.4527, 'lon' => 115.3582, 'verified' => true, 'phone' => '081234567211'],
            ['email' => 'desa.sade@desa.id', 'name' => 'Pemerintah Desa Adat Sade', 'desa' => 'Desa Adat Sade', 'kec' => 'Pujut', 'kab' => 'Kabupaten Lombok Tengah', 'prov' => 'Nusa Tenggara Barat', 'lat' => -8.8391, 'lon' => 116.2925, 'verified' => true, 'phone' => '081234567212'],
            ['email' => 'desa.salenrang@desa.id', 'name' => 'Kantor Desa Salenrang Rammang-Rammang', 'desa' => 'Desa Salenrang (Rammang-Rammang)', 'kec' => 'Bontoa', 'kab' => 'Kabupaten Maros', 'prov' => 'Sulawesi Selatan', 'lat' => -4.9283, 'lon' => 119.6175, 'verified' => true, 'phone' => '081234567213'],
            ['email' => 'desa.pampang@desa.id', 'name' => 'Lembaga Adat Dayak Desa Pampang', 'desa' => 'Desa Budaya Pampang', 'kec' => 'Samarinda Utara', 'kab' => 'Kota Samarinda', 'prov' => 'Kalimantan Timur', 'lat' => -0.3842, 'lon' => 117.1852, 'verified' => true, 'phone' => '081234567214'],
            ['email' => 'gampong.nusa@desa.id', 'name' => 'Keuchik Gampong Nusa', 'desa' => 'Gampong Nusa', 'kec' => 'Lhoknga', 'kab' => 'Kabupaten Aceh Besar', 'prov' => 'Aceh', 'lat' => 5.4831, 'lon' => 95.2638, 'verified' => true, 'phone' => '081234567215'],
            ['email' => 'kampung.tablasupa@desa.id', 'name' => 'Pemerintah Kampung Tablasupa Depapre', 'desa' => 'Kampung Tablasupa', 'kec' => 'Depapre', 'kab' => 'Kabupaten Jayapura', 'prov' => 'Papua', 'lat' => -2.4851, 'lon' => 140.3125, 'verified' => true, 'phone' => '081234567216'],
            ['email' => 'desa.sawarna@desa.id', 'name' => 'Pemerintah Desa Sawarna', 'desa' => 'Desa Sawarna', 'kec' => 'Bayah', 'kab' => 'Kabupaten Lebak', 'prov' => 'Banten', 'lat' => -6.9856, 'lon' => 106.3121, 'verified' => true, 'phone' => '081234567217'],
            ['email' => 'desa.karangrejo@desa.id', 'name' => 'Kantor Desa Karangrejo Borobudur', 'desa' => 'Desa Karangrejo', 'kec' => 'Borobudur', 'kab' => 'Kabupaten Magelang', 'prov' => 'Jawa Tengah', 'lat' => -7.6083, 'lon' => 110.1872, 'verified' => true, 'phone' => '081234567218'],
            ['email' => 'desa.ranupani@desa.id', 'name' => 'Pemerintah Desa Ranupani Tengger', 'desa' => 'Desa Ranupani', 'kec' => 'Senduro', 'kab' => 'Kabupaten Lumajang', 'prov' => 'Jawa Timur', 'lat' => -8.0163, 'lon' => 112.9497, 'verified' => true, 'phone' => '081234567219'],
            ['email' => 'desa.kotomesjid@desa.id', 'name' => 'Kantor Desa Koto Mesjid Patin', 'desa' => 'Desa Koto Mesjid', 'kec' => 'XIII Koto Kampar', 'kab' => 'Kabupaten Kampar', 'prov' => 'Riau', 'lat' => 0.3168, 'lon' => 100.7812, 'verified' => true, 'phone' => '081234567220'],
        ];

        $desaMap = [];
        $desaUserMap = [];

        foreach ($villagesData as $v) {
            $vUser = User::firstOrCreate(
                ['email' => $v['email']],
                [
                    'name' => $v['name'],
                    'password' => $defaultPassword,
                    'phone_wa' => $v['phone'],
                    'role' => 'perangkat_desa',
                    'is_verified' => $v['verified'],
                ]
            );
            $vProf = ProfilDesa::firstOrCreate(
                ['user_id' => $vUser->id],
                [
                    'nama_desa' => $v['desa'],
                    'kecamatan' => $v['kec'],
                    'kabupaten' => $v['kab'],
                    'provinsi' => $v['prov'],
                    'latitude' => $v['lat'],
                    'longitude' => $v['lon'],
                    'sk_file_url' => 'sk/' . Str::slug($v['desa']) . '.pdf',
                    'verified_at' => $v['verified'] ? now() : null,
                ]
            );
            $desaMap[$v['desa']] = $vProf;
            $desaUserMap[$v['desa']] = $vUser;
        }

        $desa1User = $desaUserMap['Desa Sukamaju'];
        $desaSukamaju = $desaMap['Desa Sukamaju'];
        $desaBerkahMakmur = $desaMap['Desa Berkah Makmur'];
        $desaCempakaPutih = $desaMap['Desa Cempaka Putih'];
        $desaPujonKidul = $desaMap['Desa Wisata Pujon Kidul'];
        $desaCibodas = $desaMap['Desa Cibodas'];
        $desaSukapura = $desaMap['Desa Sukapura'];
        $desaPonggok = $desaMap['Desa Ponggok'];
        $desaPentingsari = $desaMap['Desa Pentingsari'];
        $desaPariangan = $desaMap['Nagari Pariangan'];
        $desaPenglipuran = $desaMap['Desa Adat Penglipuran'];
        $desaSade = $desaMap['Desa Adat Sade'];
        $desaRammang = $desaMap['Desa Salenrang (Rammang-Rammang)'];
        $desaPampang = $desaMap['Desa Budaya Pampang'];
        $desaGampongNusa = $desaMap['Gampong Nusa'];
        $desaTablasupa = $desaMap['Kampung Tablasupa'];
        $desaSawarna = $desaMap['Desa Sawarna'];
        $desaKarangrejo = $desaMap['Desa Karangrejo'];
        $desaRanupani = $desaMap['Desa Ranupani'];
        $desaKotoMesjid = $desaMap['Desa Koto Mesjid'];

        // ==========================================
        // 5. MAHASISWA & KELOMPOK KKN MULTI-UNIVERSITAS
        // ==========================================

        // UNESA (Ahmad - Ketua, Siti, Bambang, Maya, Bayu)
        $mhsAhmadUser = User::firstOrCreate(
            ['email' => 'mahasiswa.ahmad@mhs.unesa.ac.id'],
            ['name' => 'Ahmad Fauzi', 'password' => $defaultPassword, 'phone_wa' => '081234567301', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsAhmadUser->id],
            ['universitas_id' => $univUnesa->id, 'nim' => '23051204001', 'jurusan' => 'Teknik Informatika', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_ahmad.pdf', 'verified_at' => now()]
        );

        $mhsSitiUser = User::firstOrCreate(
            ['email' => 'anggota.siti@mhs.unesa.ac.id'],
            ['name' => 'Siti Aminah', 'password' => $defaultPassword, 'phone_wa' => '081234567302', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsSitiUser->id],
            ['universitas_id' => $univUnesa->id, 'nim' => '23051204002', 'jurusan' => 'Desain Komunikasi Visual', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_siti.pdf', 'verified_at' => now()]
        );

        $mhsBambangUser = User::firstOrCreate(
            ['email' => 'anggota.bambang@mhs.unesa.ac.id'],
            ['name' => 'Bambang Prakoso', 'password' => $defaultPassword, 'phone_wa' => '081234567303', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsBambangUser->id],
            ['universitas_id' => $univUnesa->id, 'nim' => '23051204003', 'jurusan' => 'Manajemen', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_bambang.pdf', 'verified_at' => now()]
        );

        $kelompok1 = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN UNESA 01 - Sukamaju Digital'],
            ['ketua_id' => $mhsAhmadUser->id, 'dosen_id' => $dosenBudi->id]
        );
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok1->id, 'user_id' => $mhsAhmadUser->id], ['jurusan_kontribusi' => 'Teknik Informatika', 'role_in_group' => 'ketua']);
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok1->id, 'user_id' => $mhsSitiUser->id], ['jurusan_kontribusi' => 'Desain Komunikasi Visual', 'role_in_group' => 'anggota']);
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok1->id, 'user_id' => $mhsBambangUser->id], ['jurusan_kontribusi' => 'Manajemen', 'role_in_group' => 'anggota']);

        // ITS (Dimas, Rina)
        $mhsDimasUser = User::firstOrCreate(
            ['email' => 'ketua.dimas@mhs.its.ac.id'],
            ['name' => 'Dimas Pratama', 'password' => $defaultPassword, 'phone_wa' => '081234567304', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsDimasUser->id],
            ['universitas_id' => $univIts->id, 'nim' => '5025201001', 'jurusan' => 'Sistem Informasi', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_dimas.pdf', 'verified_at' => now()]
        );

        $mhsRinaUser = User::firstOrCreate(
            ['email' => 'anggota.rina@mhs.its.ac.id'],
            ['name' => 'Rina Kusuma', 'password' => $defaultPassword, 'phone_wa' => '081234567305', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsRinaUser->id],
            ['universitas_id' => $univIts->id, 'nim' => '5025201002', 'jurusan' => 'Teknik Lingkungan', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_rina.pdf', 'verified_at' => now()]
        );

        $kelompok2 = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN ITS Berkah Hijau'],
            ['ketua_id' => $mhsDimasUser->id, 'dosen_id' => $dosenAgus->id]
        );
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok2->id, 'user_id' => $mhsDimasUser->id], ['jurusan_kontribusi' => 'Sistem Informasi', 'role_in_group' => 'ketua']);
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok2->id, 'user_id' => $mhsRinaUser->id], ['jurusan_kontribusi' => 'Teknik Lingkungan', 'role_in_group' => 'anggota']);

        // UNESA Edukasi (Bayu, Maya)
        $mhsBayuUser = User::firstOrCreate(
            ['email' => 'ketua.bayu@mhs.unesa.ac.id'],
            ['name' => 'Bayu Setiawan', 'password' => $defaultPassword, 'phone_wa' => '081234567306', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsBayuUser->id],
            ['universitas_id' => $univUnesa->id, 'nim' => '23051204004', 'jurusan' => 'Pendidikan Bahasa Inggris', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_bayu.pdf', 'verified_at' => now()]
        );

        $mhsMayaUser = User::firstOrCreate(
            ['email' => 'anggota.maya@mhs.unesa.ac.id'],
            ['name' => 'Maya Kartika', 'password' => $defaultPassword, 'phone_wa' => '081234567309', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsMayaUser->id],
            ['universitas_id' => $univUnesa->id, 'nim' => '23051204007', 'jurusan' => 'Pendidikan Guru Sekolah Dasar', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_maya.pdf', 'verified_at' => now()]
        );

        $kelompok3 = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN UNESA 02 - Edukasi Cempaka'],
            ['ketua_id' => $mhsBayuUser->id, 'dosen_id' => $dosenRetno->id]
        );
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok3->id, 'user_id' => $mhsBayuUser->id], ['jurusan_kontribusi' => 'Pendidikan Bahasa Inggris', 'role_in_group' => 'ketua']);
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok3->id, 'user_id' => $mhsMayaUser->id], ['jurusan_kontribusi' => 'Pendidikan Guru Sekolah Dasar', 'role_in_group' => 'anggota']);

        // UB (Rizky, Nabila, Fikri)
        $mhsRizkyUbUser = User::firstOrCreate(
            ['email' => 'ketua.rizky@mhs.ub.ac.id'],
            ['name' => 'Rizky Pratama', 'password' => $defaultPassword, 'phone_wa' => '081234567310', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsRizkyUbUser->id],
            ['universitas_id' => $univUb->id, 'nim' => '2150402001', 'jurusan' => 'Agroteknologi', 'semester' => 7, 'ktm_file_url' => 'ktm/ktm_rizky_ub.pdf', 'verified_at' => now()]
        );

        $mhsNabilaUbUser = User::firstOrCreate(
            ['email' => 'anggota.nabila@mhs.ub.ac.id'],
            ['name' => 'Nabila Putri Santoso', 'password' => $defaultPassword, 'phone_wa' => '081234567311', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsNabilaUbUser->id],
            ['universitas_id' => $univUb->id, 'nim' => '2150402002', 'jurusan' => 'Ilmu Gizi', 'semester' => 7, 'ktm_file_url' => 'ktm/ktm_nabila_ub.pdf', 'verified_at' => now()]
        );

        $kelompok4Ub = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN Tematik UB - Agro Wisata Pujon'],
            ['ketua_id' => $mhsRizkyUbUser->id, 'dosen_id' => $dosenArief->id]
        );
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok4Ub->id, 'user_id' => $mhsRizkyUbUser->id], ['jurusan_kontribusi' => 'Agroteknologi', 'role_in_group' => 'ketua']);
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok4Ub->id, 'user_id' => $mhsNabilaUbUser->id], ['jurusan_kontribusi' => 'Ilmu Gizi', 'role_in_group' => 'anggota']);

        // ITB (Fathur, Cindy)
        $mhsFathurItbUser = User::firstOrCreate(
            ['email' => 'ketua.fathur@mhs.itb.ac.id'],
            ['name' => 'Fathur Rahman', 'password' => $defaultPassword, 'phone_wa' => '081234567313', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsFathurItbUser->id],
            ['universitas_id' => $univItb->id, 'nim' => '13521001', 'jurusan' => 'Teknik Elektro', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_fathur_itb.pdf', 'verified_at' => now()]
        );

        $kelompok5Itb = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'KKN ITB Inovasi - Smart Village Cibodas'],
            ['ketua_id' => $mhsFathurItbUser->id, 'dosen_id' => $dosenHendra->id]
        );
        AnggotaKelompok::firstOrCreate(['kelompok_id' => $kelompok5Itb->id, 'user_id' => $mhsFathurItbUser->id], ['jurusan_kontribusi' => 'Teknik Elektro', 'role_in_group' => 'ketua']);

        // Mahasiswa Solo & Pending
        $mhsSoloUser = User::firstOrCreate(
            ['email' => 'mhs.solo@mhs.unesa.ac.id'],
            ['name' => 'Dewi Lestari', 'password' => $defaultPassword, 'phone_wa' => '081234567307', 'role' => 'mahasiswa', 'is_verified' => true]
        );
        ProfilMahasiswa::firstOrCreate(
            ['user_id' => $mhsSoloUser->id],
            ['universitas_id' => $univUnesa->id, 'nim' => '23051204005', 'jurusan' => 'Kesehatan Masyarakat', 'semester' => 6, 'ktm_file_url' => 'ktm/ktm_dewi.pdf', 'verified_at' => now()]
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
            ['deskripsi' => 'Petani sayur di lereng bukit Lembang menghadapi fluktuasi harga dan butuh sistem irigasi pintar hemat air berbasis tenaga surya.'],
            [
                'desa_id' => $desaCibodas->id,
                'pelapor_nama' => 'Kang Asep Hidayat',
                'pelapor_wa' => '085712345681',
                'kategori' => 'lingkungan',
                'latitude' => -6.8294,
                'longitude' => 107.6711,
                'urgensi' => 'mendesak',
                'status' => 'terverifikasi',
            ]
        );

        $aspirasi4 = Aspirasi::firstOrCreate(
            ['deskripsi' => 'Pengrajin tenun songket tradisional membutuhkan pendampingan digitalisasi katalog motif kuno agar tidak punah dan bernilai ekspor.'],
            [
                'desa_id' => $desaPariangan->id,
                'pelapor_nama' => 'Datuak Bandaro Basa',
                'pelapor_wa' => '085712345682',
                'kategori' => 'umkm',
                'latitude' => -0.4497,
                'longitude' => 100.4952,
                'urgensi' => 'sedang',
                'status' => 'terverifikasi',
            ]
        );

        $aspirasi5 = Aspirasi::firstOrCreate(
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
        // 7. KATALOG POS KEBUTUHAN BESAR BERBASIS 17 SDGS (45+ POS)
        // ==========================================
        $posItems = [
            // JOMBANG
            [
                'judul' => 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong',
                'desa' => 'Desa Sukamaju',
                'aspirasi_id' => $aspirasi1->id,
                'deskripsi' => 'Pengembangan identitas visual merek kemasan modern, pendaftaran marketplace (Shopee/Tokopedia), dan pelatihan pembukuan keuangan digital untuk 15 pelaku UMKM.',
                'kategori' => 'umkm',
                'target_luaran' => ['Identitas visual & 15 desain label kemasan modern UMKM', 'Katalog produk online di marketplace digital', 'Buku panduan pembukuan keuangan kas UMKM sederhana'],
                'sdg_codes' => [8, 9],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Teknik Informatika' => 1, 'Desain Komunikasi Visual' => 1, 'Manajemen' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Pemberdayaan Posyandu Digital & Pencegahan Stunting Anak',
                'desa' => 'Desa Sukamaju',
                'aspirasi_id' => null,
                'deskripsi' => 'Digitalisasi pencatatan data tumbuh kembang balita di 5 posyandu desa serta edukasi gizi seimbang bagi ibu hamil.',
                'kategori' => 'kesehatan',
                'target_luaran' => ['Aplikasi/Spreadsheet pencatatan digital data balita posyandu', 'Buku saku menu gizi seimbang cegah stunting ibu hamil', 'Poster infografis edukasi kesehatan posyandu'],
                'sdg_codes' => [3],
                'kuota_kelompok' => 2,
                'deadline' => now()->addDays(30),
                'jurusan_dibutuhkan' => ['Kesehatan Masyarakat' => 2, 'Ilmu Gizi' => 1, 'Teknik Informatika' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Penguatan Literasi Keuangan Digital & Asuransi Usaha Tani Padi Desa',
                'desa' => 'Desa Sukamaju',
                'aspirasi_id' => null,
                'deskripsi' => 'Sosialisasi aplikasi keuangan perbankan digital dan pendampingan pendaftaran Asuransi Usaha Tani Padi (AUTP) bagi 80 petani.',
                'kategori' => 'umkm',
                'target_luaran' => ['Buku saku literasi keuangan tani', 'Rekapitulasi 80 polis pendaftaran AUTP tani desa'],
                'sdg_codes' => [1, 8],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(40),
                'jurusan_dibutuhkan' => ['Ekonomi Pembangunan' => 1, 'Akuntansi' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Revitalisasi Saluran Irigasi Tersier & Pembuatan Peta Drainase Pertanian',
                'desa' => 'Desa Sukamaju',
                'aspirasi_id' => null,
                'deskripsi' => 'Pemetaan saluran air irigasi sawah berbasis GIS dan gotong royong pembersihan sedimentasi saluran primer bersama HIPPA.',
                'kategori' => 'fasilitas',
                'target_luaran' => ['Peta teknis jaringan irigasi desa', 'RAB perbaikan pintu air bendung dusun'],
                'sdg_codes' => [6, 9],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Teknik Sipil' => 1, 'Agroteknologi' => 1],
                'status' => 'open',
            ],

            // PASURUAN
            [
                'judul' => 'Pemetaan Sistem Pengolahan Sampah Organik dan Biogas',
                'desa' => 'Desa Berkah Makmur',
                'aspirasi_id' => $aspirasi2->id,
                'deskripsi' => 'Perancangan instalasi prototipe biogas dari limbah kotoran ternak dan penyuluhan manajemen sampah ramah lingkungan.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Prototipe instalasi reaktor biogas ternak warga', 'Modul panduan pemilahan sampah organik & anorganik', 'Peta titik pengelolaan sampah dusun desa'],
                'sdg_codes' => [13, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Teknik Lingkungan' => 1, 'Sistem Informasi' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Perencanaan Masterplan Ruang Terbuka Hijau & Sarana Olahraga Desa',
                'desa' => 'Desa Berkah Makmur',
                'aspirasi_id' => null,
                'deskripsi' => 'Penyusunan dokumen desain teknis dan anggaran rencana pembangunan taman desa terpadu ramah lansia dan anak.',
                'kategori' => 'fasilitas',
                'target_luaran' => ['Gambar 3D masterplan ruang terbuka hijau desa', 'Rencana Anggaran Biaya (RAB) pembangunan fasilitas', 'Laporan analisis kelayakan lokasi taman desa'],
                'sdg_codes' => [9, 11],
                'kuota_kelompok' => 1,
                'deadline' => now()->subDays(10),
                'jurusan_dibutuhkan' => ['Teknik Sipil' => 1, 'Arsitektur' => 1],
                'status' => 'completed',
            ],
            [
                'judul' => 'Inovasi Pupuk Organik Cair Hayati dari Limbah Kulit Kopi & Feses Kambing',
                'desa' => 'Desa Berkah Makmur',
                'aspirasi_id' => null,
                'deskripsi' => 'Pelatihan fermentasi mikroba pengurai limbah perkebunan kopi menjadi pupuk organik cair bermutu tinggi ramah lingkungan.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['SOP pembuatan pupuk cair organik 1000 liter', 'Paket kemasan pupuk organik siap pakai'],
                'sdg_codes' => [12, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(55),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Biologi' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pemberdayaan Pokdarwis Ekowisata Kaki Gunung Welirang',
                'desa' => 'Desa Berkah Makmur',
                'aspirasi_id' => null,
                'deskripsi' => 'Pelatihan pemandu wisata alam, penyusunan paket tour trekking lereng Welirang, dan pembentukan website promosi desa wisata.',
                'kategori' => 'pariwisata',
                'target_luaran' => ['Buku saku standar pelayanan pemandu wisata', 'Website promosi desa wisata Prigen'],
                'sdg_codes' => [8, 11],
                'kuota_kelompok' => 2,
                'deadline' => now()->addDays(35),
                'jurusan_dibutuhkan' => ['Pariwisata' => 1, 'Ilmu Komunikasi' => 1],
                'status' => 'open',
            ],

            // MOJOKERTO PACET
            [
                'judul' => 'Bimbingan Belajar Bahasa Inggris dan Literasi Digital Sekolah Dasar',
                'desa' => 'Desa Cempaka Putih',
                'aspirasi_id' => null,
                'deskripsi' => 'Penguatan kemampuan dasar bahasa Inggris interaktif dan pengenalan literasi komputer bagi siswa SDN Pacet 01.',
                'kategori' => 'pendidikan',
                'target_luaran' => ['Modul pembelajaran interaktif bahasa Inggris dasar', 'Kegiatan literasi komputer dan pengenalan internet sehat', 'Bank soal latihan belajar siswa SD'],
                'sdg_codes' => [4],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(20),
                'jurusan_dibutuhkan' => ['Pendidikan Bahasa Inggris' => 1, 'Pendidikan Guru Sekolah Dasar' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Digitalisasi Sistem Rekam Medis Lansia & Senam Kebugaran Berkelanjutan',
                'desa' => 'Desa Cempaka Putih',
                'aspirasi_id' => null,
                'deskripsi' => 'Pencatatan riwayat tensi dan gula darah lansia secara terkomputerisasi serta pendampingan senam lansia sehat rutin.',
                'kategori' => 'kesehatan',
                'target_luaran' => ['Sistem database rekam medik posyandu lansia', 'Video panduan senam kebugaran lansia'],
                'sdg_codes' => [3, 10],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(40),
                'jurusan_dibutuhkan' => ['Keperawatan' => 1, 'Teknik Informatika' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pengembangan Taman Edukasi Tanaman Obat Keluarga (TOGA) & Hidroponik Sekolah',
                'desa' => 'Desa Cempaka Putih',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembangunan kebun TOGA interaktif dan instalasi hidroponik sayur di pekarangan balai desa dan SD.',
                'kategori' => 'pendidikan',
                'target_luaran' => ['Taman percontohan TOGA dengan barcode nama latin', 'Modul praktik berkebun hidroponik anak'],
                'sdg_codes' => [3, 4, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Pendidikan Guru Sekolah Dasar' => 1],
                'status' => 'open',
            ],

            // MALANG PUJON KIDUL
            [
                'judul' => 'Modernisasi Rantai Pasok Susu Sapi Perah & Diversifikasi Olahan Keju Organik',
                'desa' => 'Desa Wisata Pujon Kidul',
                'aspirasi_id' => null,
                'deskripsi' => 'Peningkatan nilai tambah susu sapi perah lokal melalui pendampingan teknologi higienis pasteurisasi, pembuatan keju mozarella, dan kemasan kedap udara.',
                'kategori' => 'pertanian',
                'target_luaran' => ['Standar Operasional Prosedur (SOP) pengolahan keju higienis', 'Desain kemasan premium olahan susu dan sertifikasi P-IRT', 'Kanal pemasaran daring kemitraan kafe & hotel Kota Batu'],
                'sdg_codes' => [2, 8, 12],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Ilmu Gizi' => 1, 'Peternakan' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Digital Tourism & Virtual Reality Tour Hamparan Sawah Pujon Kidul',
                'desa' => 'Desa Wisata Pujon Kidul',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembuatan video 360 derajat dan media virtual tour untuk promosi keindahan sawah dan edukasi petik sayur organik.',
                'kategori' => 'pariwisata',
                'target_luaran' => ['Video VR 360 derajat spot wisata desa', 'Peta wisata interaktif Google Maps terpadu'],
                'sdg_codes' => [8, 9, 11],
                'kuota_kelompok' => 2,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Desain Komunikasi Visual' => 1, 'Pariwisata' => 1],
                'status' => 'open',
            ],

            // BANDUNG BARAT CIBODAS LEMBANG
            [
                'judul' => 'Implementasi Smart Greenhouse IoT dan Panel Surya Kebun Sayur Hidroponik',
                'desa' => 'Desa Cibodas',
                'aspirasi_id' => $aspirasi3->id,
                'deskripsi' => 'Pembangunan prototipe greenhouse otomatis dengan sensor suhu, kelembaban, dan pompa nutrisi bertenaga surya untuk kelompok tani milenial.',
                'kategori' => 'energi',
                'target_luaran' => ['Instalasi sistem monitoring kelembaban dan irigasi IoT', 'Modul pemeliharaan panel surya dan sirkuit mikrokontroler', 'Dashboard web pemantauan kondisi mikro greenhouse desa'],
                'sdg_codes' => [7, 9, 13],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Teknik Elektro' => 1, 'Arsitektur' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Rancang Bangun Mini Lab Kultur Jaringan Tanaman Hias & Strawberry',
                'desa' => 'Desa Cibodas',
                'aspirasi_id' => null,
                'deskripsi' => 'Pengembangan fasilitas sterilisasi pembibitan bibit strawberry unggul bebas virus melalui teknik kultur jaringan sederhana.',
                'kategori' => 'pertanian',
                'target_luaran' => ['Protokol perbanyakan bibit kultur jaringan', 'Pelatihan 15 petani muda pembudidaya bunga hias'],
                'sdg_codes' => [2, 9],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(65),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Biologi' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pemberdayaan Pemuda Desa Menjadi Content Creator Promosi Agrowisata',
                'desa' => 'Desa Cibodas',
                'aspirasi_id' => null,
                'deskripsi' => 'Workshop pembuatan video pendek Reels/TikTok dan copywriting estetik untuk meningkatkan kunjungan petik strawberry desa.',
                'kategori' => 'pendidikan',
                'target_luaran' => ['10 video promosi viral desa di medsos', 'Panduan content marketing agrowisata'],
                'sdg_codes' => [4, 8],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(30),
                'jurusan_dibutuhkan' => ['Ilmu Komunikasi' => 1, 'Desain Komunikasi Visual' => 1],
                'status' => 'open',
            ],

            // BANDUNG SUKAPURA DAYEUHKOLOT
            [
                'judul' => 'Akselerasi Legalitas NIB & Tata Kelola Keuangan Digital 30 UMKM Sentra Konveksi',
                'desa' => 'Desa Sukapura',
                'aspirasi_id' => null,
                'deskripsi' => 'Pendampingan pendaftaran Nomor Induk Berusaha (NIB) OSS, sertifikasi halal self-declare, dan pelatihan aplikasi kasir point-of-sales digital.',
                'kategori' => 'umkm',
                'target_luaran' => ['Penerbitan 30 legalitas NIB dan sertifikat halal UMKM', 'Pelatihan akuntansi sederhana dan pembukuan neraca kasir', 'Profil video promosi produk unggulan sentra konveksi'],
                'sdg_codes' => [8, 11],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(40),
                'jurusan_dibutuhkan' => ['Ilmu Komunikasi' => 1, 'Akuntansi' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Sistem Mitigasi dan Early Warning System Genangan Air Berbasis IoT LoRa',
                'desa' => 'Desa Sukapura',
                'aspirasi_id' => null,
                'deskripsi' => 'Pemasangan sensor ultrasonik ketinggian debit anak sungai Citarum yang terhubung langsung dengan notifikasi WhatsApp warga.',
                'kategori' => 'fasilitas',
                'target_luaran' => ['Sensor Early Warning banjir terpasang di 3 titik', 'Aplikasi monitoring level debit sungai real-time'],
                'sdg_codes' => [9, 11, 13],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Teknik Elektro' => 1, 'Teknik Informatika' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Bank Sampah Digital Berbasis Aplikasi Mobile & Sedekah Minyak Jelantah',
                'desa' => 'Desa Sukapura',
                'aspirasi_id' => null,
                'deskripsi' => 'Digitalisasi timbangan bank sampah dusun dan konversi minyak goreng jelantah menjadi lilin aromaterapi bernilai jual.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Aplikasi pembukuan saldo nasabah bank sampah', 'Produk lilin aromaterapi daur ulang jelantah'],
                'sdg_codes' => [11, 12],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(35),
                'jurusan_dibutuhkan' => ['Teknik Lingkungan' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],

            // KLATEN PONGGOK
            [
                'judul' => 'Sistem Informasi Manajemen BUMDes & E-Ticketing Umbul Ponggok',
                'desa' => 'Desa Ponggok',
                'aspirasi_id' => null,
                'deskripsi' => 'Pengembangan modul gate tiket berbasis QR Code dan integrasi laporan arus kas keuangan harian BUMDes Tirta Mandiri.',
                'kategori' => 'umkm',
                'target_luaran' => ['Sistem e-ticketing QR code pintu masuk wisata', 'Dashboard neraca keuangan BUMDes real-time'],
                'sdg_codes' => [8, 9, 11],
                'kuota_kelompok' => 2,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Sistem Informasi' => 1, 'Akuntansi' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Optimalisasi Budidaya Perikanan Air Tawar & Sentra Pakan Mandiri Maggot BSF',
                'desa' => 'Desa Ponggok',
                'aspirasi_id' => null,
                'deskripsi' => 'Pemberdayaan budidaya larva Black Soldier Fly (BSF) untuk menekan biaya pakan ikan nila dan lele kelompok pembudidaya desa.',
                'kategori' => 'pertanian',
                'target_luaran' => ['Biopond produksi maggot BSF kapasitas 200kg/bulan', 'Formula pakan pelet ikan bernutrisi tinggi'],
                'sdg_codes' => [1, 2, 12],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Ilmu Kelautan & Perikanan' => 1, 'Biologi' => 1],
                'status' => 'open',
            ],

            // SLEMAN PENTINGSARI
            [
                'judul' => 'Pemetaan Jalur Evakuasi Ekowisata Berkelanjutan & Konservasi Sumber Mata Air Lereng Merapi',
                'desa' => 'Desa Pentingsari',
                'aspirasi_id' => null,
                'deskripsi' => 'Penyusunan peta spasial GIS jalur evakuasi bencana erupsi, penanaman 500 bibit pohon penyerap air, dan peremajaan papan interpretasi wisata alam.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Peta cetak dan digital GIS jalur aman evakuasi wisata', 'Papan informasi edukasi flora-fauna khas lereng Merapi', 'Dokumen mitigasi risiko bencana berbasis komunitas desa'],
                'sdg_codes' => [11, 13, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(55),
                'jurusan_dibutuhkan' => ['Kehutanan' => 1, 'Pariwisata' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Inkubasi Bisnis Kopi Robusta Lereng Gunung Merapi & Cupping Score Standar SCA',
                'desa' => 'Desa Pentingsari',
                'aspirasi_id' => null,
                'deskripsi' => 'Penyuluhan proses pasca-panen petik merah, teknik roasting modern, dan pengemasan drip bag coffee untuk turis mancanegara.',
                'kategori' => 'umkm',
                'target_luaran' => ['Brand kemasan kopi drip bag Pentingsari', 'Sertifikat hasil uji citarasa cupping kopi'],
                'sdg_codes' => [8, 12],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(40),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],

            // SUMATERA BARAT PARIANGAN
            [
                'judul' => 'Digitalisasi Warisan Tenun Tradisional Minangkabau & E-Katalog Nagari Pariangan',
                'desa' => 'Nagari Pariangan',
                'aspirasi_id' => $aspirasi4->id,
                'deskripsi' => 'Pencatatan digital filosofi 20 motif tenun songket nagari, pembuatan platform galeri online, dan penguatan branding desa terindah di dunia.',
                'kategori' => 'umkm',
                'target_luaran' => ['E-Booklet & video dokumenter filosofi tenun Minang', 'Website etalase galeri produk UMKM tenun nagari', 'Sistem pencatatan transaksi penjualan berbasis QRIS'],
                'sdg_codes' => [8, 11, 17],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Sistem Informasi' => 1, 'Ekonomi Pembangunan' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Pelestarian Rumah Gadang Kuno & Sistem Database Digital Pusaka Nagari',
                'desa' => 'Nagari Pariangan',
                'aspirasi_id' => null,
                'deskripsi' => 'Pencatatan arsitektur dan kepemilikan suku 40 Rumah Gadang tertua di Pariangan dengan papan QR Code silsilah adat.',
                'kategori' => 'pariwisata',
                'target_luaran' => ['Peta sebaran digital Rumah Gadang Pariangan', 'Website arsip pusaka dan sejarah nagari'],
                'sdg_codes' => [11, 16],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Arsitektur' => 1, 'Sejarah / Sosiologi' => 1],
                'status' => 'open',
            ],

            // BALI PENGLIPURAN
            [
                'judul' => 'Pelestarian Arsitektur Bambu Tradisional & Inovasi Suvenir Daur Ulang Rebung',
                'desa' => 'Desa Adat Penglipuran',
                'aspirasi_id' => null,
                'deskripsi' => 'Dokumentasi struktur angkul-angkul bambu tahan rayap, workshop pengrajin suvenir anyaman bambu modern, dan digitalisasi museum budaya desa.',
                'kategori' => 'pariwisata',
                'target_luaran' => ['Katalog digital ragam konstruksi bambu arsitektur Bali', 'Prototipe suvenir ramah lingkungan berbahan limbah bambu', 'Papan barcode informasi sejarah rumah adat pekarangan'],
                'sdg_codes' => [11, 12, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(65),
                'jurusan_dibutuhkan' => ['Arsitektur' => 1, 'Kesehatan Masyarakat' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Sistem Pengolahan Kompos Terpadu dari Daun Bambu & Limbah Upacara Adat',
                'desa' => 'Desa Adat Penglipuran',
                'aspirasi_id' => null,
                'deskripsi' => 'Penerapan konsep Zero Waste desa adat melalui pengolahan sisa janur dan bunga upacara menjadi pupuk organik pekarangan rumah.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Instalasi komposter terpadu hutan bambu desa', 'Modul Zero Waste Village berbasis Tri Hita Karana'],
                'sdg_codes' => [11, 12],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Teknik Lingkungan' => 1, 'Kesehatan Masyarakat' => 1],
                'status' => 'open',
            ],

            // LOMBOK SADE NTB
            [
                'judul' => 'Peningkatan Sanitasi Lingkungan & Edukasi Higienitas Wisata Perkampungan Sasak',
                'desa' => 'Desa Adat Sade',
                'aspirasi_id' => null,
                'deskripsi' => 'Pengadaan sarana cuci tangan ramah lingkungan, edukasi kesehatan reproduksi bagi remaja desa, dan pendampingan pemasaran kain tenun.',
                'kategori' => 'kesehatan',
                'target_luaran' => ['Wastafel ramah lingkungan berbasis kran otomatis', 'Modul penyuluhan PHBS bagi warga dan wisatawan', 'Katalog profil penenun tradisional Desa Sade'],
                'sdg_codes' => [6, 8, 10],
                'kuota_kelompok' => 2,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Kesehatan Masyarakat' => 1, 'Teknik Lingkungan' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pengembangan Bank Pakan Silase Hijauan Ternak Sapi Tahan Kemarau Panjang',
                'desa' => 'Desa Adat Sade',
                'aspirasi_id' => null,
                'deskripsi' => 'Teknologi fermentasi daun jagung dan rumput gajah untuk menjamin stok pakan ternak warga di musim kemarau kering Lombok.',
                'kategori' => 'pertanian',
                'target_luaran' => ['Bungker silase pakan ternak kapasitas 5 ton', 'Buku panduan pengawetan pakan hijauan ternak'],
                'sdg_codes' => [2, 13],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(55),
                'jurusan_dibutuhkan' => ['Peternakan' => 1, 'Agroteknologi' => 1],
                'status' => 'open',
            ],

            // MAROS SULSEL RAMMANG-RAMMANG
            [
                'judul' => 'Sistem Reservasi Wisata Perahu Karst Terpadu & Pengelolaan Sanitasi Ramah Sungai',
                'desa' => 'Desa Salenrang (Rammang-Rammang)',
                'aspirasi_id' => null,
                'deskripsi' => 'Pengembangan portal reservasi tiket susur sungai Pute, pelatihan pemandu wisata sadar konservasi, dan penyediaan fasilitas pemilah sampah perahu.',
                'kategori' => 'pariwisata',
                'target_luaran' => ['Website booking online tiket perahu wisata Rammang-Rammang', 'Tempat sampah terpilah apung di dermaga susur sungai', 'Buku panduan hospitality dan ecotourism pemandu lokal'],
                'sdg_codes' => [6, 12, 14],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(70),
                'jurusan_dibutuhkan' => ['Ilmu Kelautan' => 1, 'Teknik Lingkungan' => 1],
                'status' => 'in_progress',
            ],
            [
                'judul' => 'Edukasi Konservasi Satwa Kupu-Kupu Endemik & Agroforestri Gula Aren',
                'desa' => 'Desa Salenrang (Rammang-Rammang)',
                'aspirasi_id' => null,
                'deskripsi' => 'Penanaman pohon inang kupu-kupu khas Maros dan pendampingan kemasan higienis produk gula aren semut lokal.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Kebun pakan kupu-kupu endemik Geopark Maros', 'Desain kemasan gula aren semut organik'],
                'sdg_codes' => [15, 8],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Kehutanan' => 1, 'Biologi' => 1],
                'status' => 'open',
            ],

            // SAMARINDA KALTIM PAMPANG
            [
                'judul' => 'Pemetaan Partisipatif Batas Hutan Adat Dayak Kenyah & Konservasi Tanaman Obat',
                'desa' => 'Desa Budaya Pampang',
                'aspirasi_id' => null,
                'deskripsi' => 'Pemetaan batas wilayah adat berbasis GPS/GIS dan pendokumentasian 50 jenis tanaman obat herbal tradisional khas suku Dayak.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Peta batas kawasan hutan adat beresolusi tinggi', 'Herbarium dan buku ensiklopedia tanaman obat Dayak', 'Rute trekking edukasi hutan adat untuk wisatawan'],
                'sdg_codes' => [15, 16],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Kehutanan' => 1, 'Teknik Informatika' => 1, 'Biologi' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Digitalisasi Manik-Manik Etnik Dayak & Pembukuan Keuangan Sanggar Tari',
                'desa' => 'Desa Budaya Pampang',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembuatan video tutorial seni manik-manik dan katalog aksesoris tradisional khas Kalimantan di marketplace global.',
                'kategori' => 'umkm',
                'target_luaran' => ['Katalog produk manik-manik etnik ber-ISBN', 'Sistem pencatatan tiket pertunjukan sanggar tari'],
                'sdg_codes' => [8, 11],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Desain Komunikasi Visual' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],

            // ACEH BESAR GAMPONG NUSA
            [
                'judul' => 'Pusat Edukasi Kebencanaan Tsunami & Pemberdayaan Kerajinan Sampah Plastik',
                'desa' => 'Gampong Nusa',
                'aspirasi_id' => null,
                'deskripsi' => 'Penyusunan modul kurikulum kebencanaan untuk anak-anak sekolah dan pelatihan pembuatan suvenir bernilai jual dari limbah kantong kresek.',
                'kategori' => 'pendidikan',
                'target_luaran' => ['Modul simulasi tanggap darurat bencana tsunami sekolah', 'Pelatihan 20 ibu PKK membuat kerajinan plastik daur ulang', 'Galeri mini pameran karya ramah lingkungan gampong'],
                'sdg_codes' => [11, 12, 13],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(35),
                'jurusan_dibutuhkan' => ['Pendidikan Guru Sekolah Dasar' => 1, 'Desain Komunikasi Visual' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pelatihan Pertolongan Pertama Gawat Darurat (PPGD) & Tanggap Bencana Pesisir',
                'desa' => 'Gampong Nusa',
                'aspirasi_id' => null,
                'deskripsi' => 'Pelatihan CPR dan evakuasi darurat bagi relawan desa dan pemuda karang taruna dalam menghadapi bencana pasang laut.',
                'kategori' => 'kesehatan',
                'target_luaran' => ['Tim siaga medis bencana desa terlatih', 'Buku panduan PPGD masyarakat awam'],
                'sdg_codes' => [3, 11],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(40),
                'jurusan_dibutuhkan' => ['Kesehatan Masyarakat' => 1, 'Keperawatan' => 1],
                'status' => 'open',
            ],

            // JAYAPURA PAPUA TABLASUPA
            [
                'judul' => 'Konservasi Terumbu Karang Teluk Tanah Merah & Modernisasi Pasca-Panen Ikan',
                'desa' => 'Kampung Tablasupa',
                'aspirasi_id' => null,
                'deskripsi' => 'Transplantasi terumbu karang buatan (biorock/media semen) dan pelatihan pembuatan abon ikan tongkol higienis bagi mama-mama Papua.',
                'kategori' => 'kelautan',
                'target_luaran' => ['Pembuatan 30 modul media transplantasi karang laut', 'Pelatihan pengolahan dan pengemasan abon ikan higienis', 'Papan peringatan zona konservasi larangan bom ikan'],
                'sdg_codes' => [14, 8, 1],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(75),
                'jurusan_dibutuhkan' => ['Ilmu Kelautan' => 1, 'Ilmu Gizi' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pemberdayaan Mama-Mama Papua dalam Pengolahan Minyak Kelapa Murni (VCO)',
                'desa' => 'Kampung Tablasupa',
                'aspirasi_id' => null,
                'deskripsi' => 'Teknologi peremasan dingin minyak kelapa murni tanpa pemanasan untuk produk kesehatan dan kecantikan bernilai tinggi.',
                'kategori' => 'umkm',
                'target_luaran' => ['Produk VCO grade medis dalam botol higienis', 'Pelatihan pengemasan dan uji organoleptik'],
                'sdg_codes' => [1, 5, 8],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pemasangan Rumpon Ikan Ramah Lingkungan & GPS Nelayan Tradisional',
                'desa' => 'Kampung Tablasupa',
                'aspirasi_id' => null,
                'deskripsi' => 'Pemasangan rumpon apung alami dan edukasi penentuan titik koordinat tangkap ikan menggunakan navigasi GPS handphone.',
                'kategori' => 'kelautan',
                'target_luaran' => ['3 titik rumpon konservasi ikan laut dalam', 'Buku saku navigasi GPS melaut aman'],
                'sdg_codes' => [9, 14],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(70),
                'jurusan_dibutuhkan' => ['Ilmu Kelautan' => 1, 'Teknik Informatika' => 1],
                'status' => 'open',
            ],

            // BANTEN SAWARNA
            [
                'judul' => 'Konservasi Sarang Penyu Lekang & Eduwisata Bahari Ramah Lingkungan',
                'desa' => 'Desa Sawarna',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembuatan pos relokasi telur penyu lekang dari ancaman predator dan penyusunan SOP wisata pelepasan tukik yang bertanggung jawab.',
                'kategori' => 'kelautan',
                'target_luaran' => ['Bak penetasan pasir buatan telur penyu', 'Papan edukasi konservasi penyu Pantai Sawarna'],
                'sdg_codes' => [14, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Ilmu Kelautan' => 1, 'Pariwisata' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Penyediaan Titik Air Bersih Mandiri Bertenaga Surya untuk Dusun Pesisir',
                'desa' => 'Desa Sawarna',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembangunan pompa submersible bertenaga panel surya untuk menyuplai air tawar ke 40 KK pemukiman nelayan terpencil.',
                'kategori' => 'energi',
                'target_luaran' => ['Instalasi pompa surya 1000 Watt terpasang', 'Jaringan pipa air bersih dusun pesisir'],
                'sdg_codes' => [6, 7],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Teknik Elektro' => 1, 'Teknik Sipil' => 1],
                'status' => 'open',
            ],

            // MAGELANG KARANGREJO BOROBUDUR
            [
                'judul' => 'Pemberdayaan Pengrajin Gerabah Tradisional Menembus Pasar Ekspor Keramik',
                'desa' => 'Desa Karangrejo',
                'aspirasi_id' => null,
                'deskripsi' => 'Pengembangan teknik glazing glasir modern dan pembuatan kemasan tahan banting untuk pengiriman luar pulau gerabah Borobudur.',
                'kategori' => 'umkm',
                'target_luaran' => ['15 desain gerabah minimalis modern', 'Katalog digital ekspor gerabah Karangrejo'],
                'sdg_codes' => [8, 9],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(40),
                'jurusan_dibutuhkan' => ['Desain Komunikasi Visual' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pengembangan Balkondes Digital & Virtual Reality Tur Warisan Sekitar Borobudur',
                'desa' => 'Desa Karangrejo',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembuatan sistem reservasi homestay Balkondes online dan promosi sunrise Bukit Punthuk Setumbu berbasis digital marketing.',
                'kategori' => 'pariwisata',
                'target_luaran' => ['Website booking homestay Balkondes Karangrejo', 'Virtual Tour 360 sunrise Setumbu'],
                'sdg_codes' => [9, 11],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Sistem Informasi' => 1, 'Pariwisata' => 1],
                'status' => 'open',
            ],

            // LUMAJANG RANUPANI TENGGER
            [
                'judul' => 'Penerapan Teknologi Pengeringan Bawang Otomatis Berbasis Sensor Kelembaban',
                'desa' => 'Desa Ranupani',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembuatan rumah pengering bawang prei efek rumah kaca (solar dome dryer) untuk mencegah pembusukan pascapanen di hawa dingin Semeru.',
                'kategori' => 'pertanian',
                'target_luaran' => ['Prototipe solar dome dryer kapasitas 500kg', 'SOP pengeringan komoditas hortikultura dingin'],
                'sdg_codes' => [2, 7, 9],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(55),
                'jurusan_dibutuhkan' => ['Agroteknologi' => 1, 'Teknik Mesin / Elektro' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Konservasi Ekosistem Danau Ranu Pani & Edukasi Zero Waste Pendaki Semeru',
                'desa' => 'Desa Ranupani',
                'aspirasi_id' => null,
                'deskripsi' => 'Pembersihan gulma air Salvinia molesta di danau Ranu Pani dan pembuatan kampanye Zero Waste Mountain bagi para pendaki.',
                'kategori' => 'lingkungan',
                'target_luaran' => ['Pupuk kompos berbasis gulma danau', 'Papan aturan konservasi ekosistem TNBTS'],
                'sdg_codes' => [6, 13, 15],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(50),
                'jurusan_dibutuhkan' => ['Teknik Lingkungan' => 1, 'Kehutanan' => 1],
                'status' => 'open',
            ],

            // RIAU KAMPUNG PATIN KOTO MESJID
            [
                'judul' => 'Formulasi Pakan Ikan Patin Berbiaya Rendah Berbasis Bungkil Sawit & Silase',
                'desa' => 'Desa Koto Mesjid',
                'aspirasi_id' => null,
                'deskripsi' => 'Inovasi pencampuran limbah bungkil kelapa sawit dan maggot untuk menekan 40% biaya operasional pakan 200 kolam patin desa.',
                'kategori' => 'pertanian',
                'target_luaran' => ['Formula pelet patin protein 32%', 'Mesin pencetak pelet pakan mandiri'],
                'sdg_codes' => [1, 2, 12],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(60),
                'jurusan_dibutuhkan' => ['Ilmu Kelautan & Perikanan' => 1, 'Peternakan' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Diversifikasi Olahan Patin: Pembuatan Kerupuk Tulang Patin & Nugget Tinggi Kalsium',
                'desa' => 'Desa Koto Mesjid',
                'aspirasi_id' => null,
                'deskripsi' => 'Pemanfaatan sisa tulang dan kepala fillet ikan patin asap menjadi kerupuk renyah kaya kalsium pencegah stunting.',
                'kategori' => 'umkm',
                'target_luaran' => ['Produk kerupuk kalsium tulang patin kemasan standing pouch', 'Izin edar P-IRT dan sertifikasi halal'],
                'sdg_codes' => [2, 3, 8],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(45),
                'jurusan_dibutuhkan' => ['Ilmu Gizi' => 1, 'Manajemen' => 1],
                'status' => 'open',
            ],
            [
                'judul' => 'Pemasaran Internasional & Sertifikasi BPOM Olahan Patin Asap Desa',
                'desa' => 'Desa Koto Mesjid',
                'aspirasi_id' => null,
                'deskripsi' => 'Pendampingan uji laboratorium nutrisi dan ekspansi penjualan patin asap (Salai Patin) ke pasar ekspor Malaysia dan Singapura.',
                'kategori' => 'umkm',
                'target_luaran' => ['Dokumen registrasi izin BPOM MD olahan patin', 'Web katalog ekspor Patin Kampar'],
                'sdg_codes' => [8, 17],
                'kuota_kelompok' => 1,
                'deadline' => now()->addDays(70),
                'jurusan_dibutuhkan' => ['Ekonomi Pembangunan' => 1, 'Sistem Informasi' => 1],
                'status' => 'open',
            ],
        ];

        $posMap = [];

        foreach ($posItems as $item) {
            $desaModel = $desaMap[$item['desa']];
            $pos = PosKebutuhan::firstOrCreate(
                ['judul' => $item['judul']],
                [
                    'desa_id' => $desaModel->id,
                    'aspirasi_id' => $item['aspirasi_id'],
                    'deskripsi' => $item['deskripsi'],
                    'kategori' => $item['kategori'],
                    'target_luaran' => $item['target_luaran'],
                    'sdg_codes' => $item['sdg_codes'],
                    'kuota_kelompok' => $item['kuota_kelompok'],
                    'deadline' => $item['deadline'],
                    'jurusan_dibutuhkan' => $item['jurusan_dibutuhkan'],
                    'status' => $item['status'],
                ]
            );
            $posMap[$item['judul']] = $pos;
        }

        $pos1 = $posMap['Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong'];
        $pos2 = $posMap['Pemetaan Sistem Pengolahan Sampah Organik dan Biogas'];
        $pos4 = $posMap['Bimbingan Belajar Bahasa Inggris dan Literasi Digital Sekolah Dasar'];
        $pos6 = $posMap['Modernisasi Rantai Pasok Susu Sapi Perah & Diversifikasi Olahan Keju Organik'];
        $pos7 = $posMap['Implementasi Smart Greenhouse IoT dan Panel Surya Kebun Sayur Hidroponik'];

        // ==========================================
        // 8. PROPOSAL PENGAJUAN KKN
        // ==========================================
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

        $proposal3 = Proposal::firstOrCreate(
            ['kelompok_id' => $kelompok3->id, 'pos_kebutuhan_id' => $pos4->id],
            [
                'draf_proker' => 'Fun English & Digital Literacy Academy untuk Generasi Emas Desa Cempaka Putih',
                'file_proposal_url' => 'proposal/proposal_kkn_unesa_edukasi.pdf',
                'surat_pengantar_url' => 'surat-pengantar/surat_pengantar_unesa_02.pdf',
                'status' => 'menunggu',
                'status_kelayakan_dosen' => 'belum_ditinjau',
                'matching_score' => 100.00,
                'jarak_km' => 28.3,
                'submitted_at' => now()->subDays(2),
            ]
        );

        $proposal4Ub = Proposal::firstOrCreate(
            ['kelompok_id' => $kelompok4Ub->id, 'pos_kebutuhan_id' => $pos6->id],
            [
                'draf_proker' => 'Hilirisasi Produk Peternakan Sapi Perah: Hilirisasi Keju Organik Pujon dan Sertifikasi Halal PIRT',
                'file_proposal_url' => 'proposal/proposal_ub_pujon.pdf',
                'surat_pengantar_url' => 'surat-pengantar/surat_pengantar_ub.pdf',
                'status' => 'diterima',
                'catatan_desa' => 'Sangat dinanti oleh para peternak sapi perah desa untuk mengatasi kelebihan pasokan susu mentah.',
                'status_kelayakan_dosen' => 'layak',
                'catatan_dosen' => 'Kombinasi keahlian Agroteknologi, Gizi, dan Peternakan sangat relevan dengan target luaran.',
                'dosen_reviewed_at' => now()->subDays(12),
                'matching_score' => 100.00,
                'jarak_km' => 32.4,
                'submitted_at' => now()->subDays(14),
            ]
        );

        $proposal5Itb = Proposal::firstOrCreate(
            ['kelompok_id' => $kelompok5Itb->id, 'pos_kebutuhan_id' => $pos7->id],
            [
                'draf_proker' => 'Penerapan Teknologi Pertanian Presisi: IoT Solar Smart Greenhouse Desa Cibodas',
                'file_proposal_url' => 'proposal/proposal_itb_cibodas.pdf',
                'surat_pengantar_url' => 'surat-pengantar/surat_pengantar_itb.pdf',
                'status' => 'diterima',
                'catatan_desa' => 'Luar biasa, kami siap membantu penyediaan lahan demplot dan bahan instalasi lokal.',
                'status_kelayakan_dosen' => 'layak',
                'catatan_dosen' => 'Rancangan rangkaian elektronika dan panel surya sudah diuji kelayakan teknisnya di laboratorium ITB.',
                'dosen_reviewed_at' => now()->subDays(10),
                'matching_score' => 100.00,
                'jarak_km' => 18.2,
                'submitted_at' => now()->subDays(12),
            ]
        );

        // ==========================================
        // 9. PROGRESS MINGGUAN (LOGBOOK KKN)
        // ==========================================
        ProgressMingguan::updateOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 1],
            [
                'persentase' => 25,
                'deskripsi' => '[Survei & Pendataan UMKM Desa] Survei mendalam ke 15 pengrajin kripik singkong, pendataan bahan baku, dan identifikasi kelemahan kemasan lama.',
                'foto_url' => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(21),
            ]
        );
        ProgressMingguan::updateOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 2],
            [
                'persentase' => 50,
                'deskripsi' => '[Desain Ulang Kemasan & Sesi Foto Katalog] Desain ulang logo "Keripik Singkong Barokah Sukamaju", pembuatan template standing pouch kedap udara, dan sesi foto katalog produk.',
                'foto_url' => 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(14),
            ]
        );
        ProgressMingguan::updateOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 3],
            [
                'persentase' => 75,
                'deskripsi' => '[Pendaftaran Marketplace & Launching Web Katalog] Pendaftaran akun resmi marketplace Shopee & Tokopedia, integrasi sistem pembayaran QRIS, serta launching website katalog UMKM desa.',
                'foto_url' => 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(7),
            ]
        );
        ProgressMingguan::updateOrCreate(
            ['proposal_id' => $proposal1->id, 'minggu_ke' => 4],
            [
                'persentase' => 100,
                'deskripsi' => '[Pelatihan Pembukuan Digital & Serah Terima Aset] Pelatihan pembukuan keuangan digital melalui aplikasi BukuKas, serah terima aset digital kepada perangkat desa, dan evaluasi penjualan awal.',
                'foto_url' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
                'is_locked' => true,
                'created_at' => now()->subDays(2),
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

        try {
            $certificateService = app(CertificateService::class);
            $certificateService->issueForProposal($proposal1, $portofolio1);
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

        // ==========================================
        // 12. NOTIFIKASI MULTI-ROLE
        // ==========================================
        Notifikasi::firstOrCreate(
            ['user_id' => $desa1User->id, 'pesan' => "Proposal baru diajukan oleh kelompok 'KKN UNESA 01 - Sukamaju Digital' untuk pos kebutuhan 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong'."],
            ['channel' => 'in_app', 'is_read' => true, 'read_at' => now()->subDays(27)]
        );
        Notifikasi::firstOrCreate(
            ['user_id' => $mhsAhmadUser->id, 'pesan' => "Selamat! Luaran akhir kelompok Anda telah divalidasi oleh desa 'Desa Sukamaju'. E-Portofolio publik dan sertifikat Anda telah terbit."],
            ['channel' => 'in_app', 'is_read' => false, 'read_at' => null]
        );

        // ==========================================
        // 13. MEDSOS POST & LIVE REPORT SEEDER
        // ==========================================
        $this->call(MedsosPostSeeder::class);
    }
}