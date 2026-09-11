<?php

namespace Tests\Feature;

use App\Models\AnggotaKelompok;
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
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DashboardNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setupScenario()
    {
        Storage::fake('public');
        Storage::fake('local');

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
        ]);

        $desaUser = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desa = ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Kecamatan A',
            'kabupaten' => 'Kabupaten B',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.2575,
            'longitude' => 112.7521,
            'sk_file_url' => 'sk/desa_sk.pdf',
            'verified_at' => now(),
        ]);

        $mhsUser = User::factory()->create(['role' => 'mahasiswa', 'name' => 'Ahmad Mahasiswa', 'is_verified' => true]);
        $mhs = ProfilMahasiswa::create([
            'user_id' => $mhsUser->id,
            'universitas_id' => $universitas->id,
            'nim' => '23051204001',
            'jurusan' => 'Teknik Informatika',
            'semester' => 6,
            'ktm_file_url' => 'ktm/ktm_ahmad.pdf',
            'verified_at' => now(),
        ]);

        $mhs2User = User::factory()->create(['role' => 'mahasiswa', 'name' => 'Siti Mahasiswa', 'is_verified' => true]);
        $mhs2 = ProfilMahasiswa::create([
            'user_id' => $mhs2User->id,
            'universitas_id' => $universitas->id,
            'nim' => '23051204002',
            'jurusan' => 'Desain Komunikasi Visual',
            'semester' => 6,
            'ktm_file_url' => 'ktm/ktm_siti.pdf',
            'verified_at' => now(),
        ]);

        $kelompok = Kelompok::create([
            'ketua_id' => $mhsUser->id,
            'dosen_id' => $dosen->id,
            'nama_kelompok' => 'Kelompok KKN UNESA 01',
        ]);

        AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $mhsUser->id,
            'jurusan_kontribusi' => 'Teknik Informatika',
            'role_in_group' => 'ketua',
        ]);

        AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $mhs2User->id,
            'jurusan_kontribusi' => 'Desain Komunikasi Visual',
            'role_in_group' => 'anggota',
        ]);

        return compact('univUser', 'universitas', 'dosenUser', 'dosen', 'desaUser', 'desa', 'mhsUser', 'mhs', 'mhs2User', 'mhs2', 'kelompok');
    }

    public function test_public_can_access_dashboard_metrics()
    {
        $scenario = $this->setupScenario();

        // 1. Initial State
        $res = $this->getJson('/api/dashboard/metrics');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'total_desa_terbantu',
                    'total_umkm_terdigitalisasi',
                    'total_kelompok_kkn',
                    'total_mahasiswa_terlibat',
                    'total_jam_pengabdian',
                    'total_pos_kebutuhan',
                    'status_pos_breakdown',
                    'total_luaran_terverifikasi',
                    'total_portofolio_publik',
                    'kategori_breakdown',
                    'sdgs_distribution',
                ],
            ]);

        $this->assertEquals(1, $res->json('data.total_kelompok_kkn'));
        $this->assertEquals(2, $res->json('data.total_mahasiswa_terlibat'));
        $this->assertEquals(0, $res->json('data.total_desa_terbantu'));
        $this->assertEquals(0, $res->json('data.total_jam_pengabdian'));

        // 2. Create pos kebutuhan UMKM with SDG 8 & 9
        $pos = PosKebutuhan::create([
            'desa_id' => $scenario['desa']->id,
            'judul' => 'Digitalisasi Pasar Desa',
            'deskripsi' => 'Pengembangan marketplace lokal',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 9],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Teknik Informatika' => 1],
            'status' => 'in_progress',
        ]);

        // Create accepted proposal
        $proposal = Proposal::create([
            'kelompok_id' => $scenario['kelompok']->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Program digitalisasi UMKM desa',
            'file_proposal_url' => 'proposal/test.pdf',
            'status' => 'diterima',
            'matching_score' => 100,
            'jarak_km' => 15.5,
            'submitted_at' => now(),
        ]);

        // Submit 2 progress reports (2 members x 40 hours x 2 weeks = 160 hours)
        ProgressMingguan::create([
            'proposal_id' => $proposal->id,
            'minggu_ke' => 1,
            'persentase' => 50,
            'deskripsi' => 'Minggu ke-1: Sosialisasi',
            'is_locked' => true,
        ]);

        ProgressMingguan::create([
            'proposal_id' => $proposal->id,
            'minggu_ke' => 2,
            'persentase' => 100,
            'deskripsi' => 'Minggu ke-2: Implementasi',
            'is_locked' => true,
        ]);

        // Verify updated metrics
        $res2 = $this->getJson('/api/dashboard/metrics');
        $res2->assertStatus(200);

        $data = $res2->json('data');
        $this->assertEquals(1, $data['total_desa_terbantu']);
        $this->assertEquals(1, $data['total_umkm_terdigitalisasi']);
        $this->assertEquals(160, $data['total_jam_pengabdian']); // 2 members * 40 * 2
        $this->assertEquals(1, $data['kategori_breakdown']['umkm']);
        $this->assertEquals(1, $data['sdgs_distribution']['SDG 8']);
        $this->assertEquals(1, $data['sdgs_distribution']['SDG 9']);
    }

    public function test_automatic_notifications_triggered_across_workflow()
    {
        $scenario = $this->setupScenario();

        $pos = PosKebutuhan::create([
            'desa_id' => $scenario['desa']->id,
            'judul' => 'Pemetaan Potensi Agrowisata',
            'deskripsi' => 'Riset agrowisata desa',
            'kategori' => 'lingkungan',
            'sdg_codes' => [13, 15],
            'kuota_kelompok' => 2,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Teknik Informatika' => 1],
            'status' => 'open',
        ]);

        // 1. Mahasiswa submits proposal -> Desa gets notification
        $file = UploadedFile::fake()->create('proposal.pdf', 500, 'application/pdf');
        $resProposal = $this->actingAs($scenario['mhsUser'])
            ->postJson('/api/proposal', [
                'pos_kebutuhan_id' => $pos->id,
                'draf_proker' => 'Draf program agrowisata digital',
                'latitude' => -7.2575,
                'longitude' => 112.7521,
                'file_proposal' => $file,
            ]);
        $resProposal->assertStatus(201);
        $proposalId = $resProposal->json('data.id');

        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $scenario['desaUser']->id,
            'is_read' => false,
        ]);

        // 2. Dosen reviews proposal -> Ketua and Desa get notification
        $proposal = Proposal::find($proposalId);
        $resDosen = $this->actingAs($scenario['dosenUser'])
            ->patchJson("/api/dosen/proposal/{$proposal->id}/kelayakan", [
                'status_kelayakan' => 'layak',
                'catatan_dosen' => 'Proposal sangat inovatif dan sesuai kompetensi.',
            ]);
        $resDosen->assertStatus(200);

        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $scenario['mhsUser']->id,
        ]);

        // 3. Desa accepts proposal -> Ketua gets notification
        $resDecide = $this->actingAs($scenario['desaUser'])
            ->patchJson("/api/desa/proposal/{$proposal->id}/decide", [
                'action' => 'approve',
                'catatan_desa' => 'Selamat, proposal diterima!',
            ]);
        $resDecide->assertStatus(200);

        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $scenario['mhsUser']->id,
            'is_read' => false,
        ]);

        // 4. Mahasiswa submits progress mingguan -> Desa and Dosen get notification
        $resProgress = $this->actingAs($scenario['mhsUser'])
            ->postJson('/api/progress', [
                'proposal_id' => $proposal->id,
                'minggu_ke' => 1,
                'persentase' => 25,
                'deskripsi' => 'Survei lokasi dan koordinasi dengan kelompok tani',
            ]);
        $resProgress->assertStatus(201);

        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $scenario['dosenUser']->id,
        ]);

        // 5. Mahasiswa submits luaran -> Desa gets notification
        $deliverable = UploadedFile::fake()->create('laporan_final.zip', 2000, 'application/zip');
        $resLuaran = $this->actingAs($scenario['mhsUser'])
            ->postJson('/api/luaran', [
                'proposal_id' => $proposal->id,
                'deskripsi' => 'Aplikasi web dan panduan agrowisata desa',
                'file_deliverable' => $deliverable,
            ]);
        $resLuaran->assertStatus(201);
        $luaranId = $resLuaran->json('data.id');

        // 6. Desa verifies luaran -> Ketua and Dosen get notification
        $resVerify = $this->actingAs($scenario['desaUser'])
            ->patchJson("/api/desa/luaran/{$luaranId}/verify", [
                'ringkasan_dampak' => 'Meningkatkan kunjungan wisata hingga 40%',
                'testimoni_desa' => 'Sangat bermanfaat dan aplikatif',
            ]);
        $resVerify->assertStatus(200);

        // 7. Desa sends lecturer report -> Dosen and Universitas get notification
        $resLapDosen = $this->actingAs($scenario['desaUser'])
            ->postJson('/api/desa/laporan-dosen', [
                'dosen_id' => $scenario['dosen']->id,
                'proposal_id' => $proposal->id,
                'isi' => 'Dosen aktif membimbing mahasiswa di lapangan.',
            ]);
        $resLapDosen->assertStatus(201);
        $laporanDosenId = $resLapDosen->json('data.id');

        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $scenario['univUser']->id,
        ]);

        // 8. Universitas reviews lecturer report -> Desa gets notification
        $resUnivReview = $this->actingAs($scenario['univUser'])
            ->patchJson("/api/universitas/laporan-dosen/{$laporanDosenId}/status", [
                'status' => 'ditinjau',
            ]);
        $resUnivReview->assertStatus(200);

        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $scenario['desaUser']->id,
        ]);
    }

    public function test_notification_api_endpoints_and_isolation()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // Create notifications for userA
        $notif1 = Notifikasi::create([
            'user_id' => $userA->id,
            'pesan' => 'Notifikasi 1 untuk User A',
            'is_read' => false,
        ]);
        $notif2 = Notifikasi::create([
            'user_id' => $userA->id,
            'pesan' => 'Notifikasi 2 untuk User A',
            'is_read' => false,
        ]);

        // Create notification for userB
        $notifB = Notifikasi::create([
            'user_id' => $userB->id,
            'pesan' => 'Notifikasi untuk User B',
            'is_read' => false,
        ]);

        // 1. User A lists notifications
        $resA = $this->actingAs($userA)->getJson('/api/notifikasi');
        $resA->assertStatus(200)
            ->assertJsonCount(2, 'data.data');

        // 2. User A filters unread
        $resUnread = $this->actingAs($userA)->getJson('/api/notifikasi?unread=1');
        $resUnread->assertStatus(200)
            ->assertJsonCount(2, 'data.data');

        // 3. User A marks notif1 as read
        $resRead = $this->actingAs($userA)->patchJson("/api/notifikasi/{$notif1->id}/read");
        $resRead->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        // Check unread count is now 1
        $resUnread2 = $this->actingAs($userA)->getJson('/api/notifikasi?unread=1');
        $resUnread2->assertStatus(200)
            ->assertJsonCount(1, 'data.data');

        // 4. User A tries to read User B's notification -> 403 Forbidden
        $resForbidden = $this->actingAs($userA)->patchJson("/api/notifikasi/{$notifB->id}/read");
        $resForbidden->assertStatus(403);

        // 5. User A marks all as read
        $resReadAll = $this->actingAs($userA)->patchJson('/api/notifikasi/read-all');
        $resReadAll->assertStatus(200)
            ->assertJsonPath('updated_count', 1);

        $resUnread3 = $this->actingAs($userA)->getJson('/api/notifikasi?unread=1');
        $resUnread3->assertStatus(200)
            ->assertJsonCount(0, 'data.data');

        // User B's notification remains unread
        $this->assertFalse($notifB->fresh()->is_read);
    }
}