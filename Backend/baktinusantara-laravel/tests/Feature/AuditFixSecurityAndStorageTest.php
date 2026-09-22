<?php

namespace Tests\Feature;

use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\Proposal;
use App\Models\SuratIzinOrtu;
use App\Models\User;
use App\Services\CertificateService;
use App\Services\QrCode\QrCodeGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuditFixSecurityAndStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_whatsapp_secret_verification(): void
    {
        Config::set('services.whatsapp.webhook_secret', 'my-super-secret-token');

        // Request without secret token -> 401
        $responseUnauthorized = $this->postJson('/api/webhook/whatsapp', [
            'sender' => '081234567890',
            'message' => 'INFO',
        ]);
        $responseUnauthorized->assertStatus(401);

        // Request with wrong secret header -> 401
        $responseWrongSecret = $this->withHeaders([
            'X-Webhook-Secret' => 'wrong-secret',
        ])->postJson('/api/webhook/whatsapp', [
            'sender' => '081234567890',
            'message' => 'INFO',
        ]);
        $responseWrongSecret->assertStatus(401);

        // Request with correct secret header -> 200
        $responseSuccess = $this->withHeaders([
            'X-Webhook-Secret' => 'my-super-secret-token',
        ])->postJson('/api/webhook/whatsapp', [
            'sender' => '081234567890',
            'message' => 'INFO',
        ]);
        $responseSuccess->assertStatus(200);
    }

    public function test_aspirasi_pii_masking_for_public_vs_village(): void
    {
        $desaUser = User::factory()->create(['role' => 'perangkat_desa']);
        $desa = ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Aman Jaya',
            'latitude' => -7.25,
            'longitude' => 112.75,
            'sk_file_url' => 'sk-desa/test.pdf',
        ]);

        $aspirasi = Aspirasi::create([
            'desa_id' => $desa->id,
            'pelapor_nama' => 'Budi Santoso',
            'pelapor_wa' => '081234567890',
            'kategori' => 'umkm',
            'deskripsi' => 'Bantuan pemasaran dodol desa',
            'latitude' => -7.25,
            'longitude' => 112.75,
            'urgensi' => 'sedang',
            'status' => 'menunggu',
        ]);

        // 1. Public view (unauthenticated or another citizen) -> masked
        $publicRes = $this->getJson("/api/aspirasi/{$aspirasi->id}");
        $publicRes->assertStatus(200);
        $publicRes->assertJsonPath('data.pelapor_wa', '0812****7890');

        // 2. Village owner view (authenticated as this village) -> raw number
        $desaRes = $this->actingAs($desaUser)->getJson("/api/aspirasi/{$aspirasi->id}");
        $desaRes->assertStatus(200);
        $desaRes->assertJsonPath('data.pelapor_wa', '081234567890');
    }

    public function test_medsos_posts_requires_authentication(): void
    {
        // Unauthenticated POST -> 401
        $guestRes = $this->postJson('/api/medsos-posts', [
            'platform' => 'instagram',
            'post_url' => 'https://instagram.com/p/test12345',
            'author_name' => 'Mahasiswa KKN',
            'caption' => 'Kegiatan sosialisasi UMKM hari ini!',
        ]);
        $guestRes->assertStatus(401);

        // Authenticated POST -> 201
        $user = User::factory()->create(['role' => 'mahasiswa']);
        $authRes = $this->actingAs($user)->postJson('/api/medsos-posts', [
            'platform' => 'instagram',
            'post_url' => 'https://instagram.com/p/test12345',
            'author_name' => 'Mahasiswa KKN',
            'caption' => 'Kegiatan sosialisasi UMKM hari ini!',
        ]);
        $authRes->assertStatus(201);
        $authRes->assertJsonPath('data.author_name', 'Mahasiswa KKN');

        // Public GET medsos-posts remains open
        $getRes = $this->getJson('/api/medsos-posts');
        $getRes->assertStatus(200);
    }

    public function test_generic_upload_endpoint(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        // Unauthenticated upload -> 401
        $guestRes = $this->postJson('/api/upload', [
            'file' => UploadedFile::fake()->image('banner.jpg'),
        ]);
        $guestRes->assertStatus(401);

        // Authenticated upload -> 201
        $file = UploadedFile::fake()->image('banner.jpg', 600, 400);
        $authRes = $this->actingAs($user)->postJson('/api/upload', [
            'file' => $file,
            'folder' => 'banners',
        ]);

        $authRes->assertStatus(201);
        $authRes->assertJsonPath('status', 'success');
        $this->assertStringContainsString('banners/', $authRes->json('data.path'));
        Storage::disk('public')->assertExists($authRes->json('data.path'));
    }

    public function test_proposal_and_surat_izin_file_downloads(): void
    {
        Storage::fake('local');
        $desaUser = User::factory()->create(['role' => 'perangkat_desa']);
        $desa = ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Sukamaju',
            'latitude' => -7.25,
            'longitude' => 112.75,
            'sk_file_url' => 'sk-desa/test_sk.pdf',
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $desa->id,
            'judul' => 'Digitalisasi Pasar Desa',
            'deskripsi' => 'Pengembangan portal e-commerce desa',
            'kategori' => 'umkm',
            'status' => 'open',
        ]);

        $ketua = User::factory()->create(['role' => 'mahasiswa']);
        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Kelompok 10 KKN',
            'ketua_id' => $ketua->id,
        ]);

        $filePath = 'proposal/proposal_kkn_10.pdf';
        Storage::disk('local')->put($filePath, 'PDF PROPOSAL CONTENT');

        $suratPath = 'surat-izin-ortu/surat_izin_10.pdf';
        Storage::disk('local')->put($suratPath, 'PDF SURAT IZIN CONTENT');

        $proposal = Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Draf Proker',
            'file_proposal_url' => $filePath,
            'status' => 'diterima',
        ]);

        SuratIzinOrtu::create([
            'proposal_id' => $proposal->id,
            'required' => true,
            'file_url' => $suratPath,
        ]);

        // Unauthenticated access -> 401
        $this->getJson("/api/proposal/{$proposal->id}/file")->assertStatus(401);
        $this->getJson("/api/proposal/{$proposal->id}/surat-izin-ortu/file")->assertStatus(401);

        // Random user without permission -> 403
        $randomUser = User::factory()->create(['role' => 'mahasiswa']);
        $this->actingAs($randomUser)->getJson("/api/proposal/{$proposal->id}/file")->assertStatus(403);
        $this->actingAs($randomUser)->getJson("/api/proposal/{$proposal->id}/surat-izin-ortu/file")->assertStatus(403);

        // Ketua can download proposal file -> 200
        $resProposal = $this->actingAs($ketua)->get("/api/proposal/{$proposal->id}/file");
        $resProposal->assertStatus(200);

        // Desa can download surat izin ortu -> 200
        $resSurat = $this->actingAs($desaUser)->get("/api/proposal/{$proposal->id}/surat-izin-ortu/file");
        $resSurat->assertStatus(200);
    }

    public function test_admin_can_download_sk_and_ktm(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $univ = ProfilUniversitas::create([
            'user_id' => User::factory()->create(['role' => 'universitas'])->id,
            'nama_universitas' => 'Institut Teknologi Sepuluh Nopember',
            'kode_univ' => 'ITS',
            'alamat' => 'Surabaya',
        ]);

        // Desa SK
        $skPath = 'sk-desa/sk_pemerintah_desa.pdf';
        Storage::disk('local')->put($skPath, 'OFFICIAL SK CONTENT');
        $desa = ProfilDesa::create([
            'user_id' => User::factory()->create(['role' => 'perangkat_desa'])->id,
            'nama_desa' => 'Desa Sumber Makmur',
            'latitude' => -7.25,
            'longitude' => 112.75,
            'sk_file_url' => $skPath,
        ]);

        // Mahasiswa KTM
        $ktmPath = 'ktm-mahasiswa/ktm_5025201001.pdf';
        Storage::disk('local')->put($ktmPath, 'STUDENT KTM CONTENT');
        $mhs = ProfilMahasiswa::create([
            'user_id' => User::factory()->create(['role' => 'mahasiswa'])->id,
            'universitas_id' => $univ->id,
            'nim' => '5025201001',
            'jurusan' => 'Teknik Informatika',
            'semester' => 6,
            'ktm_file_url' => $ktmPath,
        ]);

        // Non-admin cannot download SK or KTM -> 403
        $stranger = User::factory()->create(['role' => 'mahasiswa']);
        $this->actingAs($stranger)->getJson("/api/admin/desa/{$desa->id}/sk")->assertStatus(403);
        $this->actingAs($stranger)->getJson("/api/admin/mahasiswa/{$mhs->id}/ktm")->assertStatus(403);

        // Admin downloads SK -> 200
        $resSk = $this->actingAs($admin)->get("/api/admin/desa/{$desa->id}/sk");
        $resSk->assertStatus(200);

        // Admin downloads KTM -> 200
        $resKtm = $this->actingAs($admin)->get("/api/admin/mahasiswa/{$mhs->id}/ktm");
        $resKtm->assertStatus(200);
    }

    public function test_iso_standard_qr_code_svg_structure(): void
    {
        $qrSvg = QrCodeGenerator::generateSvg('https://baktinusantara.id/verify/BN-KKN-2026-UNESA-D1-ABC123');
        $this->assertStringStartsWith('<svg', $qrSvg);
        $this->assertStringContainsString('viewBox="0 0 180 180"', $qrSvg);
        $this->assertStringContainsString('<rect', $qrSvg);
        $this->assertStringEndsWith('</svg>', $qrSvg);

        $certService = app(CertificateService::class);
        $serviceSvg = $certService->generateQrCodeSvg('https://baktinusantara.id/verify/BN-KKN-2026-ITS-D2-XYZ987');
        $this->assertStringStartsWith('<svg', $serviceSvg);
        $this->assertStringContainsString('viewBox="0 0 180 180"', $serviceSvg);
    }
}
