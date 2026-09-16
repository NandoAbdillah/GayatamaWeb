<?php

namespace Tests\Feature;

use App\Models\AnggotaKelompok;
use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PortofolioPublik;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilDosen;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\ProgressMingguan;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiContextTest extends TestCase
{
    use RefreshDatabase;

    protected function setupEnvironment()
    {
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $universitas = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $dosenUser = User::factory()->create(['role' => 'dosen', 'name' => 'Dr. Budi Santoso', 'is_verified' => true]);
        $dosen = ProfilDosen::create([
            'user_id' => $dosenUser->id,
            'universitas_id' => $universitas->id,
            'ditambahkan_oleh' => $univUser->id,
            'nip' => '198001012005011001',
            'bidang_keahlian' => 'Teknologi Informasi & IoT',
        ]);

        $desaUser = User::factory()->create(['role' => 'perangkat_desa', 'name' => 'Kades Sukamaju', 'is_verified' => true]);
        $desa = ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Cibungbulang',
            'kabupaten' => 'Bogor',
            'provinsi' => 'Jawa Barat',
            'latitude' => -6.5890,
            'longitude' => 106.6789,
            'kontak_resmi' => '081234567890',
            'verified_at' => now(),
        ]);

        $mhsUser = User::factory()->create(['role' => 'mahasiswa', 'name' => 'Ahmad Mahasiswa', 'is_verified' => true]);
        $mhs = ProfilMahasiswa::create([
            'user_id' => $mhsUser->id,
            'universitas_id' => $universitas->id,
            'nim' => '23051204001',
            'jurusan' => 'Teknik Informatika',
            'semester' => 6,
            'verified_at' => now(),
        ]);

        $kelompok = Kelompok::create([
            'ketua_id' => $mhsUser->id,
            'dosen_id' => $dosen->id,
            'nama_kelompok' => 'Kelompok KKN 14 CyberDesa',
        ]);

        AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $mhsUser->id,
            'jurusan_kontribusi' => 'Teknik Informatika',
            'role_in_group' => 'ketua',
        ]);

        return compact('univUser', 'universitas', 'dosenUser', 'dosen', 'desaUser', 'desa', 'mhsUser', 'mhs', 'kelompok');
    }

    public function test_public_can_fetch_global_ai_context()
    {
        $env = $this->setupEnvironment();

        // 1. Create aspirasi, pos kebutuhan, proposal, luaran, portofolio
        $aspirasi = Aspirasi::create([
            'desa_id' => $env['desa']->id,
            'pelapor_nama' => 'Pak Joko',
            'pelapor_wa' => '089512345678',
            'kategori' => 'umkm',
            'deskripsi' => 'Perlu bantuan website katalog produk keripik talas BUMDes',
            'latitude' => -6.5890,
            'longitude' => 106.6789,
            'urgensi' => 'sedang',
            'status' => 'terverifikasi',
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'aspirasi_id' => $aspirasi->id,
            'judul' => 'Digitalisasi Katalog Produk UMKM Desa',
            'deskripsi' => 'Pengembangan portal e-katalog dan foto produk UMKM',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 9],
            'kuota_kelompok' => 2,
            'deadline' => now()->addDays(20),
            'jurusan_dibutuhkan' => ['Teknik Informatika', 'DKV', 'Manajemen'],
            'status' => 'open',
        ]);

        $proposal = Proposal::create([
            'kelompok_id' => $env['kelompok']->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Digitalisasi BUMDes dan Katalog Produk',
            'file_proposal_url' => 'proposal/test.pdf',
            'status' => 'diterima',
            'matching_score' => 95,
            'jarak_km' => 12.4,
            'submitted_at' => now(),
        ]);

        $luaran = LuaranAkhir::create([
            'proposal_id' => $proposal->id,
            'file_deliverable_url' => 'luaran/deliverable.zip',
            'deskripsi' => 'Website katalog dan modul pelatihan admin UMKM',
            'status_verifikasi' => 'verified',
            'disahkan_oleh' => $env['desaUser']->id,
            'disahkan_at' => now(),
        ]);

        PortofolioPublik::create([
            'luaran_id' => $luaran->id,
            'slug_public' => 'katalog-umkm-sukamaju',
            'ringkasan_dampak' => 'Meningkatkan penjualan produk lokal secara online',
            'testimoni_desa' => 'Sangat bermanfaat bagi para perajin desa',
            'sertifikat_pdf_url' => 'certificates/cert-123.pdf',
            'published_at' => now(),
        ]);

        // 2. Fetch context
        $response = $this->getJson('/api/ai/context');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'timestamp',
                    'platform_metrics',
                    'open_positions_count',
                    'open_positions' => [
                        '*' => [
                            'id',
                            'judul',
                            'deskripsi',
                            'kategori',
                            'sdg_codes',
                            'kuota_kelompok',
                            'terisi_kelompok',
                            'sisa_kuota',
                            'deadline',
                            'jurusan_dibutuhkan',
                            'status',
                            'desa' => [
                                'id',
                                'nama_desa',
                                'kecamatan',
                                'kabupaten',
                                'provinsi',
                            ],
                            'aspirasi_asal',
                        ]
                    ],
                    'desa_count',
                    'desa_profiles',
                    'recent_aspirasi',
                    'recent_portofolios',
                ]
            ]);

        $this->assertEquals(1, $response->json('data.open_positions_count'));
        $this->assertEquals('Digitalisasi Katalog Produk UMKM Desa', $response->json('data.open_positions.0.judul'));
        $this->assertEquals(1, $response->json('data.open_positions.0.terisi_kelompok'));
        $this->assertEquals(1, $response->json('data.open_positions.0.sisa_kuota'));
        $this->assertCount(1, $response->json('data.recent_portofolios'));
    }

    public function test_mahasiswa_can_fetch_personalized_user_context()
    {
        $env = $this->setupEnvironment();

        $pos = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'judul' => 'Sistem Informasi Presensi Desa',
            'deskripsi' => 'Pengembangan presensi digital pegawai balai desa',
            'kategori' => 'fasilitas',
            'sdg_codes' => [9, 16],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(15),
            'jurusan_dibutuhkan' => ['Teknik Informatika'],
            'status' => 'open',
        ]);

        $proposal = Proposal::create([
            'kelompok_id' => $env['kelompok']->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Pengembangan Aplikasi Web Presensi Desa',
            'file_proposal_url' => 'proposal/presensi.pdf',
            'status' => 'diterima',
            'status_kelayakan_dosen' => 'layak',
            'matching_score' => 96,
            'jarak_km' => 8.5,
            'submitted_at' => now(),
        ]);

        ProgressMingguan::create([
            'proposal_id' => $proposal->id,
            'minggu_ke' => 1,
            'persentase' => 25,
            'deskripsi' => 'Survei dan instalasi perangkat absensi RFID',
            'is_locked' => true,
        ]);

        $response = $this->actingAs($env['mhsUser'])
            ->getJson('/api/ai/user-context');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'context' => [
                        'user' => [
                            'id' => $env['mhsUser']->id,
                            'role' => 'mahasiswa',
                        ],
                    ]
                ]
            ]);

        $roleContext = $response->json('data.context.role_context');
        $this->assertEquals('Teknik Informatika', $roleContext['profil']['jurusan']);
        $this->assertEquals('Kelompok KKN 14 CyberDesa', $roleContext['kelompok']['nama_kelompok']);
        $this->assertEquals('Dr. Budi Santoso', $roleContext['kelompok']['dosen_pembimbing']['nama']);
        $this->assertEquals(1, $roleContext['active_proposal']['total_progress_submitted']);
        $this->assertNotEmpty($response->json('data.context.todo_actions'));
    }

    public function test_perangkat_desa_can_fetch_desa_user_context()
    {
        $env = $this->setupEnvironment();

        Aspirasi::create([
            'desa_id' => $env['desa']->id,
            'pelapor_nama' => 'Ibu Siti',
            'pelapor_wa' => '0812345678',
            'kategori' => 'kesehatan',
            'deskripsi' => 'Posyandu butuh pencatatan stunting digital',
            'latitude' => -6.5890,
            'longitude' => 106.6789,
            'urgensi' => 'mendesak',
            'status' => 'menunggu',
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'judul' => 'Digitalisasi Posyandu & Gizi Balita',
            'deskripsi' => 'Sistem monitoring tinggi dan berat balita',
            'kategori' => 'kesehatan',
            'sdg_codes' => [3],
            'kuota_kelompok' => 1,
            'status' => 'open',
        ]);

        Proposal::create([
            'kelompok_id' => $env['kelompok']->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Aplikasi Posyandu Pintar',
            'file_proposal_url' => 'proposal/posyandu.pdf',
            'status' => 'menunggu',
            'status_kelayakan_dosen' => 'layak',
            'matching_score' => 92,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($env['desaUser'])
            ->getJson('/api/ai/user-context');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'context' => [
                        'user' => [
                            'id' => $env['desaUser']->id,
                            'role' => 'perangkat_desa',
                        ],
                    ]
                ]
            ]);

        $roleContext = $response->json('data.context.role_context');
        $this->assertEquals('Desa Sukamaju', $roleContext['desa']['nama_desa']);
        $this->assertEquals(1, $roleContext['total_aspirasi']);
        $this->assertCount(1, $roleContext['pending_proposals']);
        $this->assertStringContainsString('pengajuan proposal KKN', $response->json('data.context.todo_actions.0'));
    }

    public function test_dosen_can_fetch_dosen_user_context()
    {
        $env = $this->setupEnvironment();

        $pos = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'judul' => 'Smart Farming IoT',
            'deskripsi' => 'Sensor kelembaban tanah dan otomasi pompa air',
            'kategori' => 'lingkungan',
            'sdg_codes' => [9, 13],
            'kuota_kelompok' => 1,
            'status' => 'open',
        ]);

        Proposal::create([
            'kelompok_id' => $env['kelompok']->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Implementasi Sensor IoT untuk Irigasi',
            'file_proposal_url' => 'proposal/iot.pdf',
            'status' => 'menunggu',
            'status_kelayakan_dosen' => 'belum_ditinjau',
            'matching_score' => 94,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($env['dosenUser'])
            ->getJson('/api/ai/user-context');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'context' => [
                        'user' => [
                            'id' => $env['dosenUser']->id,
                            'role' => 'dosen',
                        ],
                    ]
                ]
            ]);

        $roleContext = $response->json('data.context.role_context');
        $this->assertEquals('198001012005011001', $roleContext['dosen']['nip']);
        $this->assertEquals(1, $roleContext['total_kelompok_binaan']);
        $this->assertCount(1, $roleContext['pending_validations']);
        $this->assertStringContainsString('validasi kelayakan akademis', $response->json('data.context.todo_actions.0'));
    }

    public function test_ai_recommend_pos_calculates_matching_score_and_suggests_proker()
    {
        $env = $this->setupEnvironment();

        // 1. Pos 1: Cocok dengan Informatika (IT)
        $posIT = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'judul' => 'Pengembangan Sistem Website BUMDes Sukamaju',
            'deskripsi' => 'Membangun aplikasi portal digital dan integrasi payment gateway BUMDes',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 9],
            'kuota_kelompok' => 2,
            'deadline' => now()->addDays(25),
            'jurusan_dibutuhkan' => ['Teknik Informatika', 'Sistem Informasi'],
            'status' => 'open',
        ]);

        // 2. Pos 2: Kurang cocok langsung (Pertanian)
        $posTani = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'judul' => 'Pemberian Pakan Ternak Fermentasi',
            'deskripsi' => 'Pelatihan fermentasi jerami padi untuk pakan sapi perah',
            'kategori' => 'lingkungan',
            'sdg_codes' => [12],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Peternakan', 'Nutrisi Pakan'],
            'status' => 'open',
        ]);

        $response = $this->postJson('/api/ai/recommend-pos', [
            'student_major' => 'Teknik Informatika',
            'skills' => ['web', 'database', 'sistem'],
            'kategori' => 'umkm',
            'sdg_target' => 9,
            'limit' => 2,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'query_params',
                    'total_matches',
                    'recommendations' => [
                        '*' => [
                            'pos_id',
                            'matching_score',
                            'predikat',
                            'judul',
                            'kategori',
                            'sdg_codes',
                            'kuota_kelompok',
                            'terisi_kelompok',
                            'sisa_kuota',
                            'desa',
                            'alasan_kesesuaian',
                            'rekomendasi_proker' => [
                                'nama_proker',
                                'tahapan_utama',
                            ],
                        ]
                    ]
                ]
            ]);

        $recs = $response->json('data.recommendations');
        $this->assertCount(2, $recs);

        // Pos 1 (IT) harus berada di urutan teratas dengan skor tertinggi
        $this->assertEquals($posIT->id, $recs[0]['pos_id']);
        $this->assertGreaterThanOrEqual(90, $recs[0]['matching_score']);
        $this->assertEquals('Sangat Sesuai (Highly Recommended)', $recs[0]['predikat']);
        $this->assertNotEmpty($recs[0]['alasan_kesesuaian']);
        $this->assertStringContainsString('Digitalisasi', $recs[0]['rekomendasi_proker']['nama_proker']);

        // Pos 2 skornya lebih rendah daripada Pos 1
        $this->assertGreaterThan($recs[1]['matching_score'], $recs[0]['matching_score']);
    }

    public function test_authenticated_user_can_generate_proposal_draft_from_live_pos()
    {
        $env = $this->setupEnvironment();

        $pos = PosKebutuhan::create([
            'desa_id' => $env['desa']->id,
            'judul' => 'Peningkatan Pemasaran Digital Keripik Singkong',
            'deskripsi' => 'Kelompok perajin keripik singkong kesulitan promosi online dan desain branding',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 12],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(20),
            'jurusan_dibutuhkan' => ['Teknik Informatika', 'Desain'],
            'status' => 'open',
        ]);

        $response = $this->actingAs($env['mhsUser'])
            ->postJson('/api/ai/draft-proposal', [
                'pos_id' => $pos->id,
                'kelompok_id' => $env['kelompok']->id,
                'fokus_utama' => 'Branding Visual & Marketplace Lokal',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'success',
                    'pos_id' => $pos->id,
                    'draft' => [
                        'kategori_sektor' => 'Umkm',
                        'metodologi' => 'Participatory Action Research (PAR) & Asset-Based Community Development (ABCD)',
                    ]
                ]
            ]);

        $draft = $response->json('data.draft');
        $this->assertStringContainsString('Branding Visual & Marketplace Lokal', $draft['judul_program']);
        $this->assertStringContainsString('Desa Sukamaju', $draft['desa_tujuan']);
        $this->assertStringContainsString('keripik singkong', $draft['latar_belakang']);
        $this->assertCount(4, $draft['rencana_kegiatan']);
        $this->assertGreaterThan(0, $draft['total_anggaran']);
    }

    public function test_authenticated_user_can_generate_logbook_draft()
    {
        $env = $this->setupEnvironment();

        $response = $this->actingAs($env['mhsUser'])
            ->postJson('/api/ai/draft-logbook', [
                'minggu_ke' => 2,
                'kegiatan_utama' => 'Pelatihan foto produk katalog dan packaging bersama 15 pengrajin keripik desa',
                'kendala' => 'Jadwal warga terbatas karena panen raya',
                'solusi' => 'Pelatihan dibagi menjadi dua sesi sore dan malam',
                'jam_kerja' => 8,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'success',
                    'draft_logbook' => [
                        'minggu_ke' => 2,
                        'jam_kerja_efektif' => 8,
                        'estimasi_persentase_kumulatif' => 50,
                    ]
                ]
            ]);
    }

    public function test_public_can_search_desa_with_realtime_stats()
    {
        $env = $this->setupEnvironment();

        // Desa 2 (Belum verified)
        $desaUser2 = User::factory()->create(['role' => 'perangkat_desa']);
        ProfilDesa::create([
            'user_id' => $desaUser2->id,
            'nama_desa' => 'Desa Karanganyar',
            'kecamatan' => 'Kecamatan C',
            'kabupaten' => 'Surabaya',
            'provinsi' => 'Jawa Timur',
            'verified_at' => null, // Not verified
        ]);

        // Search for Sukamaju
        $response = $this->getJson('/api/ai/search-desa?keyword=Sukamaju');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'success',
                    'total_found' => 1,
                ]
            ]);

        $this->assertEquals('Desa Sukamaju', $response->json('data.data.0.nama_desa'));
        $this->assertEquals('Bogor', $response->json('data.data.0.kabupaten'));

        // Search for unverified desa -> should return 0 matches
        $response2 = $this->getJson('/api/ai/search-desa?keyword=Karanganyar');
        $response2->assertStatus(200)
            ->assertJson([
                'data' => [
                    'total_found' => 0,
                ]
            ]);
    }
}
