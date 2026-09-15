<?php

namespace Tests\Feature;

use App\Jobs\SendWhatsAppNotificationJob;
use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\Proposal;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WhatsAppNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_phone_number_normalization(): void
    {
        $service = new WhatsAppService();

        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('081234567890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('+62812-3456-7890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('6281234567890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('812 3456 7890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('0812-3456-7890 '));
    }

    public function test_whatsapp_service_sends_http_request_with_correct_payload_and_token(): void
    {
        config([
            'services.fonnte.enabled' => true,
            'services.fonnte.token' => 'dummy-fonnte-token-123',
            'services.fonnte.url' => 'https://api.fonnte.com/send',
        ]);

        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'target' => ['6281234567890'],
                'detail' => 'Message sent',
            ], 200),
        ]);

        $service = new WhatsAppService();
        $result = $service->send('081234567890', 'Pesan Uji Coba BaktiNusantara');

        $this->assertTrue($result['status']);
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.fonnte.com/send'
                && $request->hasHeader('Authorization', 'dummy-fonnte-token-123')
                && $request['target'] === '6281234567890'
                && str_contains($request['message'], 'Pesan Uji Coba BaktiNusantara');
        });
    }

    public function test_whatsapp_service_handles_disabled_gracefully(): void
    {
        config([
            'services.fonnte.enabled' => false,
        ]);

        Http::fake();

        $service = new WhatsAppService();
        $result = $service->send('081234567890', 'Pesan Uji Coba');

        $this->assertTrue($result['status']);
        $this->assertTrue($result['mock']);
        Http::assertNothingSent();
    }

    public function test_aspirasi_submission_and_decision_dispatches_whatsapp_job(): void
    {
        Queue::fake();

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true, 'phone_wa' => '081277778888']);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Peterongan',
            'kabupaten' => 'Jombang',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.5361,
            'longitude' => 112.2811,
            'kontak_resmi' => '081277778888',
            'verified_at' => now(),
        ]);

        // 1. Submit Aspirasi
        $response = $this->postJson('/api/aspirasi', [
            'desa_id' => $profilDesa->id,
            'pelapor_nama' => 'Pak Rudi',
            'pelapor_wa' => '085712345678',
            'kategori' => 'umkm',
            'deskripsi' => 'Butuh pendampingan digitalisasi kemasan produk keripik singkong.',
            'latitude' => -7.5361,
            'longitude' => 112.2811,
            'urgensi' => 'sedang',
        ]);

        $response->assertStatus(201);
        $aspirasiId = $response->json('data.id');

        Queue::assertPushed(SendWhatsAppNotificationJob::class, function ($job) {
            return $job->target === '085712345678' && str_contains($job->message, 'Pak Rudi');
        });

        // 2. Decide Aspirasi (Approve & Convert to Pos)
        $aspirasi = Aspirasi::find($aspirasiId);
        $decideResponse = $this->actingAs($userDesa, 'sanctum')->patchJson("/api/desa/aspirasi/{$aspirasi->id}/decide", [
            'action' => 'approve',
            'judul' => 'Pengembangan Branding dan Kemasan UMKM',
            'kuota_kelompok' => 2,
            'deadline' => now()->addMonth()->toDateString(),
            'jurusan_dibutuhkan' => ['Desain Komunikasi Visual' => 1, 'Manajemen' => 1],
        ]);

        $decideResponse->assertStatus(200);

        Queue::assertPushed(SendWhatsAppNotificationJob::class, function ($job) {
            return $job->target === '085712345678' && str_contains($job->message, 'DISETUJUI & DIVERIFIKASI');
        });
    }

    public function test_proposal_submission_and_decision_dispatches_whatsapp_job(): void
    {
        Queue::fake();

        $univ = ProfilUniversitas::create([
            'user_id' => User::factory()->create(['role' => 'universitas', 'is_verified' => true])->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true, 'phone_wa' => '081233445566']);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Berkah',
            'latitude' => -7.5,
            'longitude' => 112.5,
            'verified_at' => now(),
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $profilDesa->id,
            'judul' => 'Inovasi Biogas',
            'deskripsi' => 'Pengolahan limbah kotoran sapi.',
            'kategori' => 'lingkungan',
            'kuota_kelompok' => 2,
            'deadline' => now()->addMonth(),
            'status' => 'open',
            'jurusan_dibutuhkan' => ['Teknik Elektro' => 1],
        ]);

        $ketua = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true, 'phone_wa' => '081987654321']);
        ProfilMahasiswa::create([
            'user_id' => $ketua->id,
            'universitas_id' => $univ->id,
            'nim' => '23051204001',
            'jurusan' => 'Teknik Elektro',
            'semester' => 6,
        ]);

        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Kelompok 1 Energi Bersih',
            'ketua_id' => $ketua->id,
        ]);

        // 1. Submit Proposal -> Kirim WA ke Desa
        $file = UploadedFile::fake()->create('proposal.pdf', 100, 'application/pdf');
        $proposalResponse = $this->actingAs($ketua, 'sanctum')->postJson('/api/proposal', [
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Pemasangan instalasi digester biogas.',
            'latitude' => -7.5,
            'longitude' => 112.5,
            'file_proposal' => $file,
        ]);

        $proposalResponse->assertStatus(201);
        $proposalId = $proposalResponse->json('data.id');

        Queue::assertPushed(SendWhatsAppNotificationJob::class, function ($job) {
            return $job->target === '081233445566' && str_contains($job->message, 'Kelompok 1 Energi Bersih');
        });

        // 2. Decide Proposal (Approve) -> Kirim WA ke Ketua
        $proposal = Proposal::find($proposalId);
        $decideResponse = $this->actingAs($userDesa, 'sanctum')->patchJson("/api/desa/proposal/{$proposal->id}/decide", [
            'action' => 'approve',
            'catatan_desa' => 'Proposal sangat solutif. Diterima!',
        ]);

        $decideResponse->assertStatus(200);

        Queue::assertPushed(SendWhatsAppNotificationJob::class, function ($job) use ($ketua) {
            return $job->target === '081987654321' && str_contains($job->message, $ketua->name) && str_contains($job->message, 'DISETUJUI (DITERIMA)');
        });
    }

    public function test_luaran_verification_dispatches_whatsapp_job(): void
    {
        Queue::fake();

        $univ = ProfilUniversitas::create([
            'user_id' => User::factory()->create(['role' => 'universitas', 'is_verified' => true])->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true, 'phone_wa' => '081233445566']);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'latitude' => -7.5,
            'longitude' => 112.5,
            'verified_at' => now(),
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $profilDesa->id,
            'judul' => 'Digitalisasi Desa',
            'deskripsi' => 'Pengembangan Sistem Desa.',
            'kategori' => 'umkm',
            'kuota_kelompok' => 2,
            'deadline' => now()->addMonth(),
            'status' => 'open',
            'jurusan_dibutuhkan' => ['Teknik Informatika' => 1],
        ]);

        $ketua = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true, 'phone_wa' => '081987654321']);
        ProfilMahasiswa::create([
            'user_id' => $ketua->id,
            'universitas_id' => $univ->id,
            'nim' => '23051204001',
            'jurusan' => 'Teknik Informatika',
            'semester' => 6,
        ]);

        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Kelompok 1 IT Dev',
            'ketua_id' => $ketua->id,
        ]);

        $proposal = Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Website Profil Desa',
            'file_proposal_url' => 'proposal/test.pdf',
            'status' => 'diterima',
            'matching_score' => 100,
            'jarak_km' => 10,
        ]);

        $luaran = LuaranAkhir::create([
            'proposal_id' => $proposal->id,
            'file_deliverable_url' => 'luaran/test.zip',
            'deskripsi' => 'Source code dan panduan sistem',
            'status_verifikasi' => 'menunggu',
        ]);

        $response = $this->actingAs($userDesa, 'sanctum')->patchJson("/api/desa/luaran/{$luaran->id}/verify", [
            'ringkasan_dampak' => 'Sistem desa berhasil dibangun dan digunakan oleh warga.',
            'testimoni_desa' => 'Mahasiswa sangat kreatif dan solutif!',
        ]);

        $response->assertStatus(200);

        Queue::assertPushed(SendWhatsAppNotificationJob::class, function ($job) use ($ketua) {
            return $job->target === '081987654321' && str_contains($job->message, 'Verified by Village');
        });
    }
}